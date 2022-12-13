'use strict';

export default class MathUtils
{
    static vecCopy(a)
    {
        return [a[0], a[1], a[2]];
    }

    static vecAdd(a, b)
    {
        return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
    }

    static vecSubtract(a, b)
    {
        return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
    }

    static vecScale(a, s)
    {
        if (typeof s === 'number')
            return [a[0] * s, a[1]  * s, a[2] * s];
        
        return [a[0] * s[0], a[1]  * s[1], a[2] * s[2]];
    }

    static vecProduct(a, b)
    {
        return (a[0] * b[0] + a[1] * b[1] + a[2] * b[2]);
    }

    static matrix2Vec(a)
    {
        let result = [];
        for (var i = 0; i < a.length; i++)
            result = result.concat(a[i]);
        
        return result;
    }

    static matrixMultiply(a, b)
    {
        var shape_a = [a.length. a[0].length];
        var shape_b = [b.length, b[0].length];

        if (shape_a[1] != shape_b[0])
            return [];

        let result = [];

        for (var i = 0; i < shape_a[0]; i++)
        {
            result.push([]);
            for (var j = 0; j < shape_b[1]; j++)
            {
                let val = 0;
                for (var k = 0; k < shape_b[0]; k++)
                    val += a[i][k] * b[j][k];

                result[i].push(val);
            }
        }

        return this.matrix2Vec(result);
    }

    static rotateX(p, angle)
    {
        var theta = angle / Math.PI;

        var p_mat = [[p[0]], [p[1]], [p[2], [1]]];
        var r_mat = [
            [1, 0, 0, 0],
            [0, Math.cos(theta), -Math.sin(theta), 0],
            [0, Math.sin(theta), Math.cos(theta), 0],
            [0, 0, 0, 1]
        ];
        return this.matrixMultiply(r_mat, p_mat);
    }

    static rotateY(p, angle)
    {
        var theta = angle / Math.PI;

        var p_mat = [[p[0]], [p[1]], [p[2], [1]]];
        var r_mat = [
            [Math.cos(theta), 0, Math.sin(theta), 0],
            [0, 1, 0, 0],
            [-Math.sin(theta), 0, Math.cos(theta), 0],
            [0, 0, 0, 1]
        ];
        return this.matrixMultiply(r_mat, p_mat);
    }

    static rotateZ(p, angle)
    {
        var theta = angle / Math.PI;

        var p_mat = [[p[0]], [p[1]], [p[2], [1]]];
        var r_mat = [
            [Math.cos(theta), -Math.sin(theta), 0, 0],
            [Math.sin(theta), Math.cos(theta), 0, 0],
            [0, 0, 1, 0],
            [0, 0, 0, 1]
        ];
        return this.matrixMultiply(r_mat, p_mat);
    }
}

module.exports = MathUtils;