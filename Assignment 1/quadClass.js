class Disk
{

    // TODO: Still needs to implement stacks
    constructor(slices = 0, stacks = 0, innerCenter = 0, outerCenter = 0, innerRadius, outerRadius, theta)
    {
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
        let p = vec3.create();

        let distPerStack = (outerRadius - innerRadius) / stacks;

        //inner ring
        this.colors =  [ ];
        this.indices = [ ];
        for (let n = 0; n < stacks; n++)
        {
            let m = mat4.create();
            mat4.translate(m,m, innerCenter);
            for (let i = 0; i < this.numVrts; i++) {
                mat4.rotate(m, m, Radians(this.numDeg), z_axis);
                vec3.transformMat4(p, vec3.fromValues(innerRadius + (n * distPerStack), 0, 0), m);
                this.vrts.push(p[0], p[1], p[2]);
                for (let j = 0; j < 3; j++)
                    this.colors.push(Math.random());
            }
        }

        //outer ring
        let m = mat4.create();
        mat4.translate(m,m, outerCenter);
        for (let i = 0; i < this.numVrts; i++) {
            mat4.rotate(m, m, Radians(this.numDeg), z_axis);
            vec3.transformMat4(p, vec3.fromValues(outerRadius, 0, 0), m);
            this.vrts.push(p[0], p[1], p[2]);
            for (let j = 0; j < 3; j++)
                this.colors.push(Math.random());
        }
        //mat4.translate(m,m, -outerCenter);

        let slc = (this.vrts.length / 3) / 2;

        for (let k = 0; k < stacks; k++)
        {
            //Creates all triangles
            for (let i = 0; i < (this.vrts.length / 3) / 2; i++)
            {

                if (i >= ((this.vrts.length / 3) / 2) * (theta / 360))
                {
                    break;
                }

                if (i == ((this.vrts.length / 3) / 2) -1)
                {
                    let temp = 0;
                    let temp2 = i + ((this.vrts.length / 3) / 2);
                    let temp3 = ((this.vrts.length / 3) / 2 );
                    this.indices.push((k * slc) + i, (k * slc) + temp, (k * slc) + temp2);
                    this.numToDraw += 3;

                    this.indices.push((k * slc) + temp, (k * slc) + temp2, (k * slc) + temp3);
                    this.numToDraw += 3;
                }
                else
                {
                    let temp = i+1;
                    let temp2 = i + ((this.vrts.length / 3) / 2);
                    let temp3 = temp2+1;
                    this.indices.push((k * slc) + i, (k * slc) + temp, (k * slc) + temp2);
                    this.numToDraw += 3;

                    this.indices.push((k * slc) + temp, (k * slc) + temp2, (k * slc) + temp3);
                    this.numToDraw += 3;

                }

            }
        }

        //Create all line segments
        for (let k = 0; k < stacks; k++)
        {
            for (let i = 0; i < (this.vrts.length / 3) / stacks; i++)
            {
                if (i >= ((this.vrts.length / 3) / 2) * (theta / 360))
                {
                    break;
                }

                if (i == ((this.vrts.length / 3) / 2) -1)
                {
                    let temp = 0;
                    let temp2 = i + ((this.vrts.length / 3) / 2);
                    let temp3 = ((this.vrts.length / 3) / 2 );
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
                    let temp2 = i + ((this.vrts.length / 3) / 2);
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
        
        console.log(this.vrts.length);
        console.log(this.numToDraw);
        console.log(this.vrts);

        console.log(this.vrts.length);
        console.log(this.numAxes);
        console.log(this.vrts);

        //console.log("Tsgseojhgosiknflakfnqepowifn00");

        //cols  1,0,0,  0,1,0
        //1,2,8,  2,3,8, inds
        // 0, 3, 4,  0,1,5,  1,2,6,  2,3,7,
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

    RecalculateOutline(triangle)
    {
        if (triangle.vrts.length % 9 != 0)
            throw('vrts length is not a multiple of 9')

        let numTriangles = triangle.vrts.length / 9;
        let numSegs = numTriangles * 3;
        for (let i = 0; i < numTriangles; i++)
        {
            let v0_offset = i * 3;

            for (let j = 0; j < 3; j++)
            {
                let innerOffset = j * 3;
                triangle.lsv.push(triangle.vrts[v0_offset + innerOffset]);
                triangle.lsv.push(triangle.vrts[v0_offset + innerOffset + 1]);
                triangle.lsv.push(triangle.vrts[v0_offset + innerOffset + 2]);

                innerOffset = (innerOffset + 3) % 9;
                triangle.lsv.push(triangle.vrts[v0_offset + innerOffset]);
                triangle.lsv.push(triangle.vrts[v0_offset + innerOffset + 1]);
                triangle.lsv.push(triangle.vrts[v0_offset + innerOffset + 2]);
            }
        }

    }

}
