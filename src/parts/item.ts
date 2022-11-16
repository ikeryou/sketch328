import { MyObject3D } from "../webgl/myObject3D";
import { Mesh } from 'three/src/objects/Mesh';
import { Object3D } from 'three/src/core/Object3D';
import { Util } from "../libs/util";
import { Vector3 } from 'three/src/math/Vector3';
import { Color } from 'three/src/math/Color';
import { MeshBasicMaterial } from 'three/src/materials/MeshBasicMaterial';
import { Conf } from "../core/conf";
import { HSL } from "../libs/hsl";

export class Item extends MyObject3D {

  private _id:number;
  private _item:Array<{mesh:Object3D, noise:Vector3}> = [];
  private _speed:number = 2;

  constructor(opt:any) {
    super()

    this._id = opt.id;
    this._c = this._id * 1;

    const num = 1;
    for(let i = 0; i < num; i++) {

      // const col:Color = Util.instance.randomArr(Conf.instance.COLOR).clone();
      const col:Color = Conf.instance.COLOR[this._id % Conf.instance.COLOR.length].clone();
      const hsl:HSL = new HSL();
      col.getHSL(hsl);
      hsl.l *= Util.instance.map(this._id, 0.2, 1.2, 0, Conf.instance.NUM - 1);
      col.setHSL(hsl.h, hsl.s, hsl.l);

      let m = new Mesh(
        opt.geoShape,
        new MeshBasicMaterial({
          color:col,
        })
      );
      this.add(m);

      this._item.push({
        mesh:m,
        noise:new Vector3(Util.instance.random(0, 1), Util.instance.random(0, 1), Util.instance.random(0, 1))
      });
    }
  }


  public updateItem(opt:{radius:number, moveRadius:number, center:Vector3}):void {
    const baseRadius = opt.radius * 1;

    // スケールとか
    this._item.forEach((val,i) => {
      const m = val.mesh;

      let radius = Util.instance.map(i, baseRadius, baseRadius * 0.5, 0, this._item.length - 1);
      if(this._id % 2 == 0) radius *= 1.2;
      m.scale.set(radius, radius, 1);
    })

    // くるくる
    const r = Util.instance.radian(this._c)
    this.position.x = opt.center.x + Math.sin(r) * opt.moveRadius;
    this.position.y = opt.center.y + Math.cos(r) * opt.moveRadius;
  }


  protected _update():void {
    this._c += this._speed;
  }


  protected _resize(): void {
    super._resize();
  }
}