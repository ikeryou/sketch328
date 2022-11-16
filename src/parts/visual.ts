import { Func } from '../core/func';
import { Canvas } from '../webgl/canvas';
import { Object3D } from 'three/src/core/Object3D';
import { Update } from '../libs/update';
import { Item } from './item';
import { Vector3 } from 'three/src/math/Vector3';
import { MousePointer } from '../core/mousePointer';
import { CircleGeometry } from 'three/src/geometries/CircleGeometry';
import { Eye } from './eye';
import { Conf } from '../core/conf';
import { Util } from '../libs/util';

export class Visual extends Canvas {

  private _con:Object3D;
  private _item:Array<Item> = [];
  private _eye:Array<Eye> = [];

  constructor(opt: any) {
    super(opt);

    this._con = new Object3D();
    this.mainScene.add(this._con);

    // 共通で使うGeo
    const geoShapeA = new CircleGeometry(0.5, 32);
    const geoShapeB = new CircleGeometry(0.5, 8);

    for(let i = 0; i < Conf.instance.NUM; i++) {
      const item = new Item({
        id:i,
        geoShape:i % 2 == 0 ? geoShapeA : geoShapeB,
      })
      if(i == 0) {
        this._con.add(item);
      } else {
        this._item[i - 1].add(item);
      }

      this._item.push(item);
    }

    // 目
    for(let i = 0; i < 2; i++) {
      const eye = new Eye();
      this._con.add(eye);
      this._eye.push(eye);
    }

    this._resize()
  }


  protected _update(): void {
    super._update()

    this._con.position.y = Func.instance.screenOffsetY() * -1;

    const w = Func.instance.sw();
    const h = Func.instance.sh();

    const mkake = 0.0025 * 1;
    const mx = MousePointer.instance.easeNormal.x * w * mkake;
    const my = MousePointer.instance.easeNormal.y * h * mkake * -1;

    let baseRadius = Math.min(w, h) * 0.5;
    let moveRadius = 0;
    let center = new Vector3(mx, my, 0);
    let kake = 0.99;

    this._item.forEach((val) => {
      val.updateItem({
        radius:baseRadius,
        moveRadius:moveRadius * 1,
        center:center.clone(),
      });

      moveRadius = baseRadius - (baseRadius * kake);
      baseRadius *= kake;
    });

    // 目
    const d = Math.sin(this._c * 0.025) * w * 0.05;
    this._eye.forEach((val,i) => {
      val.position.x = w * 0.15 + d;
      val.position.y = my * 30 + h * 0.1;
      if(i == 1) val.position.x *= -1;
      val.position.x += mx * 30;

      val.rotation.z = Util.instance.radian(20) * (i == 0 ? 1 : -1)
    });

    if (this.isNowRenderFrame()) {
      this._render()
    }
  }


  private _render(): void {
    this.renderer.setClearColor(0x666d77, 1);
    this.renderer.render(this.mainScene, this.cameraOrth);
  }


  public isNowRenderFrame(): boolean {
    return this.isRender && Update.instance.cnt % 1 == 0
  }


  _resize(isRender: boolean = true): void {
    super._resize();

    const w = Func.instance.sw();
    const h = Func.instance.sh();

    this.renderSize.width = w;
    this.renderSize.height = h;

    this._updateOrthCamera(this.cameraOrth, w, h);
    this._updatePersCamera(this.cameraPers, w, h);

    let pixelRatio: number = window.devicePixelRatio || 1;

    this.renderer.setPixelRatio(pixelRatio);
    this.renderer.setSize(w, h);
    this.renderer.clear();

    if (isRender) {
      this._render();
    }
  }
}
