class Disk
{

    constructor(slices = 0, stacks = 0, innerCenter = 0, outerCenter = 0, innerRadius, outerRadius, theta)
    {
        //stores the constructor args
        this.slices = slices;
        this.stacks = stacks;
        this.theta = theta;
        this.innerRadius = innerRadius;
        this.outerRadius = outerRadius;
        this.innerCenter = innerCenter;
        this.outerCenter = outerCenter;
        
        //stores the number of indices to be drawn
        this.numToDraw = 0;
        this.numAxes = 0;

        //creates the VAO vertex array Object Basically an umbrella term that we can turn on and off
        this.vao = gl.createVertexArray();
        this.vrts_buffer = gl.createBuffer(); 
        this.indx_buffer = gl.createBuffer();
        this.colr_buffer = gl.createBuffer();

        //sets up arrays for the line segs
        this.axcolors = [ ];
        this.axindices = [ ];

        //creates the VAO vertex array Object Basically an umbrella term that we can turn on and off
        this.axvao = gl.createVertexArray();
	    this.axvrts_buffer = gl.createBuffer();
	    this.axindx_buffer = gl.createBuffer();
	    this.axcolr_buffer = gl.createBuffer();

        //tracks the number of vertices to be created and how many degrees between each vertex
        this.numVrts = slices;
        this.numDeg = 360 / slices;

        //sets up the vertex array
        this.vrts = [ ];

        //one function to rule them all [Creates the vertices]
        this.CreateVertices();
        //one function to find them [the triangles, it also binds them to the buffer]
        this.ReloadTriangles();
        //One function to bring them all and in the buffer bind them [specifically the line segments]
        this.ReloadLineSegs();
        
        console.log(this.vrts.length);
        console.log(this.numToDraw);
        console.log(this.vrts);

        console.log(this.vrts.length);
        console.log(this.numAxes);
        console.log(this.vrts);

        console.log('Vertex buffer: ' + this.vrts_buffer);
        console.log('Vertices: ' + this.vrts);
        console.log('VAO: ' + this.vao);
    }

    CreateVertices()
    {
        //calculates the radius increase per stack
        let distPerStack = (this.outerRadius - this.innerRadius) / this.stacks;

        //gets the y and z values from the center vectors and calculates the increment for each stack
        let stacky = (this.outerCenter[1] - this.innerCenter[1]) / this.stacks;
        let stackz = (this.outerCenter[2] - this.innerCenter[2]) / this.stacks;

        let p = vec3.create();
        
        this.vrts = [];
        //this.colors =  [ ];
        this.indices = [ ];

        //For each stack
        for (let n = 0; n < this.stacks+1; n++)
        {
            let m = mat4.create();
            //create rings of vertices, [3 for the elves, 7 for the dwarf lords, 9 for the race of men]
            mat4.translate(m,m, this.innerCenter);
            for (let i = 0; i < this.numVrts; i++) {
                mat4.rotate(m, m, Radians(this.numDeg), z_axis);
                //use the stack number * the value for each axis
                vec3.transformMat4(p, vec3.fromValues(this.innerRadius + (n * distPerStack), (n*stacky), (n*stackz)), m);
                this.vrts.push(p[0], p[1], p[2]);
            }
        }
    }

    ReloadTriangles()
    {
        //Creates all triangles

        this.indices = [];
        this.numToDraw = 0;
        let slc = this.slices;
        //for each stack
        for (let k = 0; k < this.stacks; k++)
        {
            //loop through the number of slices
            for (let i = 0; i < this.slices; i++)
            {
                //if we have reached theta, stop creating more of the shape
                //this gives us the ability to create half circles
                if (i >= (this.slices * (this.theta / 360)))
                {
                    break;
                }

                //if we have gotten to the last slice in this stack
                if (i == (this.slices -1))
                {
                    //jump temp back to the beginning of this stack
                    let temp = i-(this.slices-1);
                    //move temp2 ahead to the end of the next stack
                    let temp2 = i + this.slices;
                    //move temp ahead to the next vertex
                    let temp3 = i+1;
                    //push the two triangles
                    //and increment the num to draw
                    this.indices.push((k * this.slices) + i, (k * this.slices) + temp, (k * this.slices) + temp2);
                    this.indices.push((k * slc) + temp, (k * slc) + temp2, (k * slc) + temp3);
                    this.numToDraw += 6;
                }
                else
                {
                    //set temp == the next vertex
                    let temp = i+1;
                    //jump temp2 ahead one stack
                    let temp2 = i + this.slices;
                    //set temp3 == the next vertex after temp2
                    let temp3 = temp2+1;
                    //push the two triangles
                    //and increment the num to draw
                    this.indices.push((k * slc) + i, (k * slc) + temp, (k * slc) + temp2);
                    this.indices.push((k * slc) + temp, (k * slc) + temp2, (k * slc) + temp3);
                    this.numToDraw += 6;

                }

            }
        }

        gl.bindVertexArray(this.vao);  //binds the Umbrella  which enables the buffer on the GPU
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vrts_buffer);  //bind the vrts buffer and using the array buffer to pass a bunch of numbers

        //says att 1 is going to have type float with 3 dimensions, 
        gl.vertexAttribPointer(solid_shader.a_vertex_coordinates, 3, gl.FLOAT, false, 0, 0);  // color_shader is the #1 loaded on 110
        
        //turns on att 1
        gl.enableVertexAttribArray(solid_shader.a_vertex_coordinates);
        
        //stuffs the data from CPU -> GPU
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vrts), gl.STATIC_DRAW);

        //this is the indices 
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indx_buffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), gl.STATIC_DRAW);

        /*	This unbinding of the VAO is necessary.
        */

       gl.bindVertexArray(null); // null unbinds something
       gl.bindBuffer(gl.ARRAY_BUFFER, null); 
       gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    }

    //Create all line segments
    ReloadLineSegs()
    {
        this.axindices = [];
        this.numAxes = 0;

        //shorthand for slices
        let slc = this.slices;

        //for each stack
        for (let k = 0; k < this.stacks; k++)
        {
            //and for the number of slices
            for (let i = 0; i < this.slices; i++)
            {
                //if we have reached theta, stop creating more of the shape
                //this gives us the ability to create half circles
                if (i >= (this.slices * (this.theta / 360)))
                {
                    break;
                }

                //if we have gotten to the last slice in this stack
                if (i == this.slices -1)
                {
                    //jump temp back to the beginning of this stack
                    let temp = i-(this.slices-1);
                    //move temp2 ahead to the end of the next stack
                    let temp2 = i + this.slices;
                    //move temp3 to the next vertex
                    let temp3 = i+1;
                    //push the line segment indices
                    //and increment the num to draw
                    this.axindices.push((k * slc) + i, (k * slc) + temp);
                    this.axindices.push((k * slc) + temp, (k * slc) + temp2);
                    this.axindices.push((k * slc) + temp2, (k * slc) + i);
                    this.numAxes += 6;

                    this.axindices.push((k * slc) + temp3, (k * slc) + temp2);
                    this.numAxes += 2;
                }
                else
                {
                    //set temp == the next vertex
                    let temp = i+1;
                    //jump temp2 to the equivalent spot in the next stack
                    let temp2 = i + this.slices;
                    //temp3 == the vertex after temp2
                    let temp3 = temp2+1;

                    //push the line segment indices
                    //and increment the num to draw
                    this.axindices.push((k * slc) + i, (k * slc) + temp);
                    this.axindices.push((k * slc) + temp, (k * slc) + temp2);
                    this.axindices.push((k * slc) + temp2, (k * slc) + i);
                    this.numAxes += 6;

                    this.axindices.push((k * slc) + temp2, (k * slc) + temp3);
                    this.axindices.push((k * slc) + temp, (k * slc) + temp3);
                    this.numAxes += 4;

                }

            }
        }

        //Bind the axes
        //bind the vao
        gl.bindVertexArray(this.axvao);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.axvrts_buffer);
        //uses the solid shader for the line segments
        gl.vertexAttribPointer(solid_shader.a_vertex_coordinates, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(solid_shader.a_vertex_coordinates);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vrts), gl.STATIC_DRAW);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.axindx_buffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.axindices), gl.STATIC_DRAW);

        /*	This unbinding of the VAO is necessary.
        */

        gl.bindVertexArray(null); // null unbinds something
        gl.bindBuffer(gl.ARRAY_BUFFER, null); 
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    }

    Draw(M,V,P)
    {
        //Loads the solid shader program
        gl.useProgram(solid_shader.program);
        
        //Initializes the M, V, and P matrices in solid shader
        gl.uniformMatrix4fv(solid_shader.u_m, false, M);
        gl.uniformMatrix4fv(solid_shader.u_v, false, V);
        gl.uniformMatrix4fv(solid_shader.u_pj, false, P);

        //if wireframe is enabled
        if (wireframe)
        {
            //Sets the solid shader colour
            gl.uniform4fv(solid_shader.u_color, vec4.fromValues(1.0, 1.0, 1.0, 1.0));

            //Binds the line seg vao and draws it
            gl.bindVertexArray(quad.axvao);
            gl.drawElements(gl.LINES, quad.numAxes, gl.UNSIGNED_SHORT, 0);
        }

        //if the triangles are enabled
        if (shapeToggle)
        {
            //Sets the solid shader colour
            gl.uniform4fv(solid_shader.u_color, vec4.fromValues(.1, .8, .4, 1.0));
            
            //Binds the triangles vao and draws it
            gl.bindVertexArray(quad.vao);
            gl.drawElements(gl.TRIANGLES, quad.numToDraw, gl.UNSIGNED_SHORT, 0);
        }

    }  


}
