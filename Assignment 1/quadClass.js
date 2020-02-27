class Disk
{

    // TODO: Still needs to implement stacks
    constructor(slices = 0, stacks = 0, innerCenter = 0, outerCenter = 0, innerRadius, outerRadius, theta)
    {
        this.slices = slices;
        this.stacks = stacks;
        this.theta = theta;
        this.innerRadius = innerRadius;
        this.outerRadius = outerRadius;
        this.innerCenter = innerCenter;
        this.outerCenter = outerCenter;
        this.numToDraw = 0;
        this.numAxes = 0;
        this.vao = gl.createVertexArray();  //creates the VAO vertex array Object Basically an umbrella term that we can turn on and off
        this.vrts_buffer = gl.createBuffer(); 
        this.indx_buffer = gl.createBuffer();
        this.colr_buffer = gl.createBuffer();

        this.axcolors = [ ];
        this.axindices = [ ];

        this.axvao = gl.createVertexArray();
	    this.axvrts_buffer = gl.createBuffer();
	    this.axindx_buffer = gl.createBuffer();
	    this.axcolr_buffer = gl.createBuffer();

        this.numVrts = slices;
        this.numDeg = 360 / slices;

        //Create all the vertices
        this.vrts = [ ];

        this.CreateVertices();
        this.ReloadTriangles();
        this.ReloadLineSegs();
        //this.numToDraw = this.indices.length;
        //this.numAxes = this.axindices.length;
        
        console.log(this.vrts.length);
        console.log(this.numToDraw);
        console.log(this.vrts);

        console.log(this.vrts.length);
        console.log(this.numAxes);
        console.log(this.vrts);

        //Bind the axes
        gl.bindVertexArray(this.axvao);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.axvrts_buffer);
        gl.vertexAttribPointer(color_shader.a_vertex_coordinates, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(color_shader.a_vertex_coordinates);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vrts), gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.axcolr_buffer);
        gl.vertexAttribPointer(color_shader.a_colors, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(color_shader.a_colors);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.axcolors), gl.STATIC_DRAW);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.axindx_buffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.axindices), gl.STATIC_DRAW);

        /*	This unbinding of the VAO is necessary.
        */

        gl.bindVertexArray(null); // null unbinds something
        gl.bindBuffer(gl.ARRAY_BUFFER, null); 
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

        console.log('Vertex buffer: ' + this.vrts_buffer);
        console.log('Vertices: ' + this.vrts);
        console.log('VAO: ' + this.vao);
    }

    CreateVertices()
    {
        
        let distPerStack = (this.outerRadius - this.innerRadius) / this.stacks;

        //gets the y and z values from the center vectors and calculates the increment for each stack
        let stacky = (this.outerCenter[1] - this.innerCenter[1]) / this.stacks;
        let stackz = (this.outerCenter[2] - this.innerCenter[2]) / this.stacks;
        //console.log(stackcenters);

        let p = vec3.create();
        //inner ring
        this.vrts = [];
        this.colors =  [ ];
        this.indices = [ ];
        for (let n = 0; n < this.stacks+1; n++)
        {
            let m = mat4.create();
            mat4.translate(m,m, this.innerCenter);
            for (let i = 0; i < this.numVrts; i++) {
                mat4.rotate(m, m, Radians(this.numDeg), z_axis);
                vec3.transformMat4(p, vec3.fromValues(this.innerRadius + (n * distPerStack), (n*stacky), (n*stackz)), m);
                this.vrts.push(p[0], p[1], p[2]);
                for (let j = 0; j < 3; j++)
                    this.colors.push(Math.random());
            }
        }
    }

    ReloadTriangles()
    {
        this.indices = [];
        this.numToDraw = 0;
        let slc = this.slices;

        for (let k = 0; k < this.stacks; k++)
        {
            //Creates all triangles
            for (let i = 0; i < this.slices; i++)
            {

                if (i >= (this.slices * (this.theta / 360)))
                {
                    break;
                }

                if (i == (this.slices -1))
                {
                    let temp = i-(this.slices-1);
                    let temp2 = i + this.slices;
                    let temp3 = i+1;
                    this.indices.push((k * this.slices) + i, (k * this.slices) + temp, (k * this.slices) + temp2);
                    this.numToDraw += 3;

                    this.indices.push((k * slc) + temp, (k * slc) + temp2, (k * slc) + temp3);
                    this.numToDraw += 3;
                }
                else
                {
                    let temp = i+1;
                    let temp2 = i + this.slices;
                    let temp3 = temp2+1;
                    this.indices.push((k * slc) + i, (k * slc) + temp, (k * slc) + temp2);
                    this.numToDraw += 3;

                    this.indices.push((k * slc) + temp, (k * slc) + temp2, (k * slc) + temp3);
                    this.numToDraw += 3;

                }

            }
        }

        gl.bindVertexArray(this.vao);  //binds the Umbrella  which enables the buffer on the GPU
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vrts_buffer);  //bind the vrts buffer and using the array buffer to pass a bunch of numbers

        //says att 1 is going to have type float with 3 dimensions, 
        gl.vertexAttribPointer(color_shader.a_vertex_coordinates, 3, gl.FLOAT, false, 0, 0);  // color_shader is the #1 loaded on 110
        
        //turns on att 1
        gl.enableVertexAttribArray(color_shader.a_vertex_coordinates);
        
        //stuffs the data from CPU -> GPU
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vrts), gl.STATIC_DRAW);

        //binding the color buffer with att 0
        gl.bindBuffer(gl.ARRAY_BUFFER, this.colr_buffer);

        gl.vertexAttribPointer(color_shader.a_colors, 3, gl.FLOAT, false, 0, 0);

        //Static Draw says GPU organize the memory in a way that data won't be overridden
        //dynamic Draw would say organize the Mem so we can frequently update
        gl.enableVertexAttribArray(color_shader.a_colors);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.colors), gl.STATIC_DRAW);

        //this is the indices 
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indx_buffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), gl.STATIC_DRAW);

        /*	This unbinding of the VAO is necessary.
        */

       gl.bindVertexArray(null); // null unbinds something
       gl.bindBuffer(gl.ARRAY_BUFFER, null); 
       gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    }

    ReloadLineSegs()
    {
        this.axcolors = [];
        this.axindices = [];
        this.numAxes = 0;

        let slc = this.slices;
        //Create all line segments
        for (let k = 0; k < this.stacks; k++)
        {
            for (let i = 0; i < this.slices; i++)
            {
                if (i >= (this.slices * (this.theta / 360)))
                {
                    break;
                }

                if (i == this.slices -1)
                {
                    let temp = i-(this.slices-1);
                    let temp2 = i + this.slices;
                    let temp3 = i+1;
                    this.axindices.push((k * slc) + i, (k * slc) + temp);
                    this.axindices.push((k * slc) + temp, (k * slc) + temp2);
                    this.axindices.push((k * slc) + temp2, (k * slc) + i);

                    this.numAxes += 6;

                    this.axindices.push((k * slc) + temp3, (k * slc) + temp2);
                    this.numAxes += 2;
                }
                else
                {
                    let temp = i+1;
                    let temp2 = i + this.slices;
                    let temp3 = temp2+1;
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

        for (let i = 0; i < this.axindices.length * 1.5; i++)
            this.axcolors.push(255);

        //Bind the axes
        gl.bindVertexArray(this.axvao);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.axvrts_buffer);
        gl.vertexAttribPointer(color_shader.a_vertex_coordinates, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(color_shader.a_vertex_coordinates);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vrts), gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.axcolr_buffer);
        gl.vertexAttribPointer(color_shader.a_colors, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(color_shader.a_colors);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.axcolors), gl.STATIC_DRAW);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.axindx_buffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.axindices), gl.STATIC_DRAW);

        /*	This unbinding of the VAO is necessary.
        */

        gl.bindVertexArray(null); // null unbinds something
        gl.bindBuffer(gl.ARRAY_BUFFER, null); 
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    }

}
