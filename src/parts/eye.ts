import { MyObject3D } from "../webgl/myObject3D";
import { Mesh } from 'three/src/objects/Mesh';
import { Object3D } from 'three/src/core/Object3D';
import { Util } from "../libs/util";
import { MeshBasicMaterial } from 'three/src/materials/MeshBasicMaterial';
import { Func } from "../core/func";
import { MousePointer } from "../core/mousePointer";
import { ShapeGeometry } from 'three/src/geometries/ShapeGeometry';
import { Shape } from 'three/src/extras/core/Shape';
import { Vector3 } from 'three/src/math/Vector3';
import { CatmullRomCurve3 } from 'three/src/extras/curves/CatmullRomCurve3';

export class Eye extends MyObject3D {

  private _con:Object3D;

  private _speed:number = 1;

  constructor() {
    super()

    this._c = Util.instance.randomInt(0, 1000);

    this._con = new Object3D();
    this.add(this._con);

    for(let i = 0; i < 3; i++) {
      const m = new Mesh(
        this._makeGeo(),
        new MeshBasicMaterial({
          color:[0xffffff, 0x000000, 0xffffff][i],
          transparent:true,
          depthTest:false,
        })
      );
      this._con.add(m);
    }
  }


  private _makeGeo(num:number = 10):ShapeGeometry {
    const arr:Array<Vector3> = []

    const radius = 0.5
    let i = 0
    while(i < num) {
      let radian = Util.instance.radian((360 / num) * i);
      let addRadius = Func.instance.sin2(this._c * 0.05 + i * 20) * 0.05;
      let x = Math.sin(radian) * (radius + addRadius)
      let y = Math.cos(radian) * (radius + addRadius)
      arr.push(new Vector3(x, y, 0))
      i++
    }

    const curve = new CatmullRomCurve3(arr, true);
    const points = curve.getPoints(128)
    const shape = new Shape()

    points.forEach((val,i) => {
      if(i == 0) {
        shape.moveTo(val.x, val.y)
      } else {
        shape.lineTo(val.x, val.y)
      }
    })

    return new ShapeGeometry(shape)
  }


  protected _update():void {
    this._c += this._speed;

    const sw = Func.instance.sw();
    const sh = Func.instance.sh();

    const mx = MousePointer.instance.easeNormal.x;
    const my = MousePointer.instance.easeNormal.y * -1;

    this._con.children.forEach((val,i) => {
      const m = val as Mesh;

      // うにょうにょ更新
      m.geometry.dispose();
      m.geometry = this._makeGeo([40, 10, 5][i]);

      let s = Math.max(sw, sh) * 0.1;
      s *= [1, 0.35, 0.05][i];
      val.scale.set(s, s, 1);

      if(i >= 1) {
        const r = Math.max(sw, sh) * 0.1 * 0.15;
        val.position.x = mx * r * 1;
        val.position.y = Util.instance.map(my, 0, r, -1, 1);
      }

      if(i == 2) {
        val.position.x += -s;
        val.position.y += s;
      }
    });

    const rad = Util.instance.radian(this._c * -1.2);
    const r = sw * 0.025;
    this._con.position.x = Math.sin(rad) * r;
    this._con.position.y = Math.cos(rad) * r;
  }


  protected _resize(): void {
    super._resize();
  }
}