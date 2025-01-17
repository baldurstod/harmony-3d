import { BinaryReader } from 'harmony-binary-reader';
import { HarmonyContextMenuItems } from 'harmony-ui';
import { mat3 } from 'gl-matrix';
import { mat4 } from 'gl-matrix';
import { quat } from 'gl-matrix';
import { vec2 } from 'gl-matrix';
import { vec3 } from 'gl-matrix';
import { vec4 } from 'gl-matrix';

/**
 * Add proxy. Copies the value of a variable to another.
 * @comment input variable name: srcvar1
 * @comment input variable name: srcvar2
 * @comment ouput variable name: resultVar
 */
export declare class Add extends Proxy_2 {
    execute(variables: any): void;
}

export declare function addIncludeSource(name: string, source?: string): void;

export declare class AddVectorToVector extends Operator {
    fieldOutput: number;
    fieldInput: number;
    scale: vec3;
    offsetMin: vec3;
    offsetMax: vec3;
    _paramChanged(paramName: any, value: any): void;
    doInit(particle: any, elapsedTime: any): void;
}

export declare class AlphaFadeAndDecay extends SourceEngineParticleOperator {
    static functionName: string;
    constructor();
    doOperate(particle: any, elapsedTime: any): void;
}

export declare class AlphaFadeInRandom extends SourceEngineParticleOperator {
    static functionName: string;
    constructor();
    doOperate(particle: any, elapsedTime: any): void;
}

export declare class AlphaFadeOutRandom extends SourceEngineParticleOperator {
    static functionName: string;
    constructor();
    doOperate(particle: any, elapsedTime: any): void;
}

export declare class AlphaRandom extends SourceEngineParticleOperator {
    static functionName: string;
    constructor();
    doInit(particle: any, elapsedTime: any): void;
}

export declare class AmbientLight extends Light {
    isAmbientLight: boolean;
    constructor(params?: any);
    static constructFromJSON(json: any): Promise<AmbientLight>;
    static getEntityName(): string;
    is(s: string): boolean;
}

declare interface Animated {
    hasAnimations: true;
    getAnimations: () => Promise<Set<string>>;
    playSequence: (name: string) => void;
    playAnimation: (name: string) => void;
    setAnimation: (id: number, name: string, weight: number) => void;
}

export declare class AnimatedTextureProxy extends Proxy_2 {
    #private;
    init(): void;
    execute(variables: any, proxyParams: any, time: any): void;
}

export declare class AnimatedWeaponSheen extends Proxy_2 {
    #private;
    init(): void;
    execute(variables: any, proxyParams: any, time: any): void;
}

declare class Animation_2 {
    #private;
    weight: number;
    constructor(name: string);
    [Symbol.iterator]: () => ArrayIterator<[number, AnimationFrame]>;
    addFrame(animationFrame: AnimationFrame): void;
    addBone(bone: AnimationBone): void;
    get name(): any;
    get frameCount(): number;
    set fps(fps: number);
    get fps(): number;
    get bones(): AnimationBone[];
    getFrame(id: number): AnimationFrame | undefined;
}

declare class AnimationBone {
    #private;
    refPosition: vec3;
    refQuaternion: quat;
    constructor(id: number, name: string, position: vec3, quaternion: quat);
    get id(): number;
    get name(): string;
}

declare class AnimationFrame {
    #private;
    constructor(frameId: number);
    setDatas(name: string, type: AnimationFrameDataType, datas: Array<AnimationFrameDataTypes>): void;
    pushData(name: string, data: AnimationFrameDataTypes): void;
    getData(name: string): AnimationFrameData;
}

declare class AnimationFrameData {
    type: AnimationFrameDataType;
    datas: Array<AnimationFrameDataTypes>;
    constructor(type: AnimationFrameDataType, datas?: Array<AnimationFrameDataTypes>);
    pushData(data: AnimationFrameDataTypes): void;
}

declare enum AnimationFrameDataType {
    Vec3 = 0,
    Quat = 1,
    Number = 2,
    Boolean = 3
}

declare type AnimationFrameDataTypes = vec3 | quat | number | boolean;

declare type AnyTexture = Texture | CubeTexture;

export declare class ApplySticker extends Node_2 {
    #private;
    inputTexture?: Texture;
    constructor(editor: NodeImageEditor, params?: any);
    operate(context?: any): Promise<void>;
    get title(): string;
    toString(tabs?: string): Promise<string>;
    dispose(): void;
}

export declare class AttractToControlPoint extends Operator {
    componentScale: vec3;
    falloffPower: number;
    scaleLocal: boolean;
    applyMinForce: boolean;
    _paramChanged(paramName: any, value: any): void;
    doForce(particle: any, elapsedTime: any, accumulatedForces: any, strength?: number): void;
}

export declare const ATTRIBUTE_CHANGED = "attributechanged";

export declare type AttributeChangedEventData = PropertyChangedEventData;

export declare class AudioGroup {
    name: string;
    muted: boolean;
    groups: Map<any, any>;
    audioList: Set<HTMLMediaElement>;
    constructor(name: string);
    mute(mute: any): void;
    getGroup(groupPath: any): any;
    createSubGroup(name: any): AudioGroup;
    playAudio(audio: any): void;
}

export declare class AudioMixer {
    static master: AudioGroup;
    static muteGroup(groupName: string, mute?: boolean): void;
    static mute(mute?: boolean): void;
    static getGroup(groupName?: string): any;
    static playAudio(groupName: any, audio: any): void;
}

export declare class BackGround {
    render(renderer: Renderer, camera: Camera): void;
    dispose(): void;
    is(s: string): boolean;
}

export declare class BasicMovement extends Operator {
    gravity: vec3;
    drag: number;
    maxConstraintPasses: number;
    _paramChanged(paramName: any, value: any): void;
    doOperate(particle: any, elapsedTime: any): void;
}

export declare class BeamBufferGeometry extends BufferGeometry {
    constructor(segments?: any);
    set segments(segments: any);
}

export declare class BeamSegment {
    pos: vec3;
    normal: vec3;
    color: vec4;
    texCoordY: number;
    width: number;
    constructor(pos: any, color?: vec4, texCoordY?: number, width?: number);
    distanceTo(other: any): number;
}

export declare class BenefactorLevel extends Proxy_2 {
    #private;
    setParams(datas: any): void;
    init(): void;
    execute(variables: any): void;
}

export declare function Bias(value: number, bias: number): number;

export declare enum BlendingEquation {
    Add = 32774,
    Subtract = 32778,
    ReverseSubtract = 32779,
    Min = 32775,
    Max = 32776
}

export declare enum BlendingFactors {
    Zero = 0,
    One = 1,
    SrcColor = 768,
    OneMinusSrcColor = 769,
    DstColor = 774,
    OneMinusDstColor = 775,
    SrcAlpha = 770,
    OneMinusSrcAlpha = 771,
    DstAlpha = 772,
    OneMinusDstAlpha = 773,
    ConstantColor = 32769,
    OneMinusConstantColor = 32770,
    ConstantAlpha = 32771,
    OneMinusConstantAlpha = 32772,
    SrcAlphaSaturate = 776
}

export declare enum BlendingMode {
    None = 0,
    Normal = 1,
    Additive = 2,
    Substractive = 3,
    Multiply = 4
}

declare type BodyGroupChoice = {
    choice: string;
    bodyGroup: string;
    bodyGroupId: number;
};

export declare class Bone extends Entity {
    #private;
    isBone: boolean;
    dirty: boolean;
    lastComputed: number;
    tempPosition: vec3;
    tempQuaternion: quat;
    constructor(params?: any);
    set position(position: vec3);
    get position(): vec3;
    setWorldPosition(position: vec3): void;
    set refPosition(refPosition: vec3);
    get refPosition(): vec3;
    getTotalRefPosition(position?: vec3): vec3;
    getTotalRefQuaternion(quaternion?: quat): quat;
    set quaternion(quaternion: vec4);
    get quaternion(): vec4;
    set refQuaternion(refQuaternion: vec4);
    get refQuaternion(): vec4;
    set scale(scale: vec3);
    get scale(): vec3;
    set parent(parent: Entity);
    get parent(): Entity;
    set skeleton(skeleton: Skeleton);
    get skeleton(): Skeleton;
    set parentSkeletonBone(parentSkeletonBone: Bone);
    get parentSkeletonBone(): Bone;
    get boneMat(): mat4;
    get worldPos(): vec3;
    get worldQuat(): quat;
    get worldScale(): vec3;
    getWorldPosition(vec?: vec3): vec3;
    getWorldQuaternion(q?: quat): vec4;
    getWorldScale(vec?: vec3): vec3;
    getWorldPosOffset(offset: vec3, out?: vec3): vec3;
    set poseToBone(poseToBone: mat4);
    get poseToBone(): mat4;
    set boneId(boneId: number);
    get boneId(): number;
    isProcedural(): boolean;
    reset(): void;
    buildContextMenu(): {
        visibility: {
            i18n: string;
            selected: boolean;
            f: () => void;
        };
        remove: {
            i18n: string;
            f: () => void;
        };
        destroy: {
            i18n: string;
            f: () => void;
        };
        remove_more: {
            i18n: string;
            submenu: {
                i18n: string;
                f: () => void;
            }[];
        };
        name: {
            i18n: string;
            f: () => void;
        };
        add: {
            i18n: string;
            submenu: any;
        };
        entitynull_1: any;
        position: {
            i18n: string;
            f: () => void;
        };
        translate: {
            i18n: string;
            f: () => void;
        };
        reset_position: {
            i18n: string;
            f: () => vec3;
        };
        entitynull_2: any;
        quaternion: {
            i18n: string;
            f: () => void;
        };
        rotate: {
            i18n: string;
            submenu: {
                i18n: string;
                f: () => void;
            }[];
        };
        reset_rotation: {
            i18n: string;
            f: () => quat;
        };
        entitynull_3: any;
        scale: {
            i18n: string;
            f: () => void;
        };
        reset_scale: {
            i18n: string;
            f: () => vec3;
        };
        entitynull_4: any;
        wireframe: {
            i18n: string;
            selected: boolean;
            f: () => void;
        };
        cast_shadows: {
            i18n: string;
            selected: boolean;
            f: () => void;
        };
        receive_shadows: {
            i18n: string;
            selected: boolean;
            f: () => void;
        };
        material: {
            i18n: string;
            submenu: {};
        };
    } & {
        Bone_1: any;
        unlock: {
            i18n: string;
            f: (entity: Bone) => false;
        };
    };
    toJSON(): any;
    static constructFromJSON(json: JSONObject): Promise<Bone>;
    fromJSON(json: any): void;
    static getEntityName(): string;
}

export declare class BoundingBox {
    min: vec3;
    max: vec3;
    empty: boolean;
    setPoints(points: number[] | Float32Array): void;
    addPoints(pointArray: number[] | Float32Array): void;
    addBoundingBox(boundingBox: BoundingBox): void;
    reset(): void;
    get center(): vec3;
    getCenter(center?: vec3): vec3;
    get size(): vec3;
    getSize(size?: vec3): vec3;
}

export declare class BoundingBoxHelper extends Box {
    boundingBox: BoundingBox;
    constructor(params?: any);
    update(): void;
    getWorldPosition(vec?: vec3): vec3;
    getWorldQuaternion(q?: quat): quat;
    getBoundingBox(boundingBox?: BoundingBox): BoundingBox;
}

export declare class Box extends Mesh {
    #private;
    constructor(params?: any);
    buildContextMenu(): {
        visibility: {
            i18n: string;
            selected: boolean;
            f: () => void;
        };
        remove: {
            i18n: string;
            f: () => void;
        };
        destroy: {
            i18n: string;
            f: () => void;
        };
        remove_more: {
            i18n: string;
            submenu: {
                i18n: string;
                f: () => void;
            }[];
        };
        name: {
            i18n: string;
            f: () => void;
        };
        add: {
            i18n: string;
            submenu: any;
        };
        entitynull_1: any;
        position: {
            i18n: string;
            f: () => void;
        };
        translate: {
            i18n: string;
            f: () => void;
        };
        reset_position: {
            i18n: string;
            f: () => vec3;
        };
        entitynull_2: any;
        quaternion: {
            i18n: string;
            f: () => void;
        };
        rotate: {
            i18n: string;
            submenu: {
                i18n: string;
                f: () => void;
            }[];
        };
        reset_rotation: {
            i18n: string;
            f: () => quat;
        };
        entitynull_3: any;
        scale: {
            i18n: string;
            f: () => void;
        };
        reset_scale: {
            i18n: string;
            f: () => vec3;
        };
        entitynull_4: any;
        wireframe: {
            i18n: string;
            selected: boolean;
            f: () => void;
        };
        cast_shadows: {
            i18n: string;
            selected: boolean;
            f: () => void;
        };
        receive_shadows: {
            i18n: string;
            selected: boolean;
            f: () => void;
        };
        material: {
            i18n: string;
            submenu: {};
        };
    } & {
        Box_1: any;
        width: {
            i18n: string;
            f: () => void;
        };
        height: {
            i18n: string;
            f: () => void;
        };
        depth: {
            i18n: string;
            f: () => void;
        };
        cube: {
            i18n: string;
            f: () => void;
        };
    };
    toJSON(): any;
    static constructFromJSON(json: any, entities: any, loadedPromise: any): Promise<Box>;
    static getEntityName(): string;
    setSize(width: number, height: number, depth: number): void;
    setwidth(width: number): void;
    setHeight(height: number): void;
    setDepth(depth: number): void;
}

export declare class BufferAttribute {
    #private;
    itemSize: number;
    dirty: boolean;
    _array: typeof TypedArrayProto;
    count: number;
    _buffer?: WebGLBuffer;
    divisor: number;
    constructor(array: typeof TypedArrayProto, itemSize: number);
    get type(): any;
    set usage(usage: BufferUsage);
    set target(target: GLenum);
    set array(array: typeof TypedArrayProto);
    setArray(array: typeof TypedArrayProto): void;
    update(glContext: WebGLAnyRenderingContext): void;
    updateWireframe(glContext: WebGLAnyRenderingContext): void;
    clone(): BufferAttribute;
    setSource(source: any): void;
    getBuffer(): WebGLBuffer;
}

export declare class BufferGeometry {
    #private;
    attributes: Map<string, BufferAttribute>;
    dirty: boolean;
    count: number;
    properties: Map<string, any>;
    getAttribute(name: string): BufferAttribute;
    setAttribute(name: string, attribute: BufferAttribute): void;
    hasAttribute(name: string): boolean;
    deleteAttribute(name: string): void;
    get elementArrayType(): number;
    setIndex(attribute: BufferAttribute): void;
    update(glContext: any): void;
    computeVertexNormals(): void;
    clone(): BufferGeometry;
    addUser(user: any): void;
    removeUser(user: any): void;
    hasNoUser(): boolean;
    hasOnlyUser(user: any): boolean;
    dispose(): void;
}

declare enum BufferUsage {
    StaticDraw = 35044,
    DynamicDraw = 35048,
    StreamDraw = 35040,
    StaticRead = 35045,
    DynamicRead = 35049,
    StreamRead = 35041,
    StaticCopy = 35046,
    DynamicCopy = 35050,
    StreamCopy = 35042
}

export declare class BuildingInvis extends Proxy_2 {
}

export declare class BuildingRescueLevel extends Proxy_2 {
    #private;
    setParams(datas: any): void;
    init(): void;
    execute(variables: any): void;
}

/**
 * BurnLevel proxy.
 * @comment ouput variable name: resultVar
 */
export declare class BurnLevel extends Proxy_2 {
    #private;
    init(): void;
    execute(variables: any, proxyParams: any): void;
}

export declare class Camera extends Entity {
    #private;
    isPerspective: boolean;
    isOrthographic: boolean;
    constructor(params?: any);
    computeCameraMatrix(): void;
    reset(): void;
    setProjection(projection: CameraProjection): void;
    get projection(): CameraProjection;
    setProjectionMix(projectionMix: any): void;
    set projectionMix(projectionMix: number);
    get projectionMix(): number;
    set nearPlane(nearPlane: number);
    get nearPlane(): number;
    set farPlane(farPlane: number);
    get farPlane(): number;
    set orthoZoom(orthoZoom: number);
    get orthoZoom(): number;
    set verticalFov(verticalFov: number);
    get verticalFov(): number;
    getTanHalfVerticalFov(): number;
    set aspectRatio(aspectRatio: number);
    get aspectRatio(): number;
    set upVector(upVector: vec3);
    get upVector(): vec3;
    set left(left: number);
    get left(): number;
    set right(right: number);
    get right(): number;
    set top(top: number);
    get top(): number;
    set bottom(bottom: number);
    get bottom(): number;
    dirty(): void;
    get cameraMatrix(): mat4;
    get projectionMatrix(): mat4;
    get projectionMatrixInverse(): mat4;
    get worldMatrixInverse(): mat4;
    distanceFrom(point: any): number;
    set position(position: vec3);
    get position(): vec3;
    set quaternion(quaternion: quat);
    get quaternion(): quat;
    toString(): string;
    setActiveCamera(): void;
    buildContextMenu(): {
        visibility: {
            i18n: string;
            selected: boolean;
            f: () => void;
        };
        remove: {
            i18n: string;
            f: () => void;
        };
        destroy: {
            i18n: string;
            f: () => void;
        };
        remove_more: {
            i18n: string;
            submenu: {
                i18n: string;
                f: () => void;
            }[];
        };
        name: {
            i18n: string;
            f: () => void;
        };
        add: {
            i18n: string;
            submenu: any;
        };
        entitynull_1: any;
        position: {
            i18n: string;
            f: () => void;
        };
        translate: {
            i18n: string;
            f: () => void;
        };
        reset_position: {
            i18n: string;
            f: () => vec3;
        };
        entitynull_2: any;
        quaternion: {
            i18n: string;
            f: () => void;
        };
        rotate: {
            i18n: string;
            submenu: {
                i18n: string;
                f: () => void;
            }[];
        };
        reset_rotation: {
            i18n: string;
            f: () => quat;
        };
        entitynull_3: any;
        scale: {
            i18n: string;
            f: () => void;
        };
        reset_scale: {
            i18n: string;
            f: () => vec3;
        };
        entitynull_4: any;
        wireframe: {
            i18n: string;
            selected: boolean;
            f: () => void;
        };
        cast_shadows: {
            i18n: string;
            selected: boolean;
            f: () => void;
        };
        receive_shadows: {
            i18n: string;
            selected: boolean;
            f: () => void;
        };
        material: {
            i18n: string;
            submenu: {};
        };
    } & {
        camera1: any;
        cameraPerspective: {
            i18n: string;
            selected: boolean;
            f: () => void;
        };
        cameraOrthographic: {
            i18n: string;
            selected: boolean;
            f: () => void;
        };
        cameraNearPlane: {
            i18n: string;
            f: () => void;
        };
        cameraFarPlane: {
            i18n: string;
            f: () => void;
        };
        cameraOrthoZoom: {
            i18n: string;
            f: () => void;
        };
        cameraFov: {
            i18n: string;
            f: () => void;
        };
        cameraSetActiveCamera: {
            i18n: string;
            f: () => void;
        };
    };
    invertProjection(v3: any): void;
    copy(source: any): void;
    toJSON(): any;
    static constructFromJSON(json: any): Promise<Camera>;
    static getEntityName(): string;
    is(s: string): boolean;
}

export declare class CameraControl {
    #private;
    constructor(camera?: Camera);
    set enabled(enabled: boolean);
    get enabled(): boolean;
    set camera(camera: Camera);
    get camera(): Camera | undefined;
    setupCamera(): void;
    handleEnabled(): void;
    update(delta: number): void;
}

export declare class CameraFrustum extends Mesh {
    #private;
    constructor();
    update(): void;
    parentChanged(parent: any): void;
}

export declare enum CameraProjection {
    Perspective = 0,
    Orthographic = 1,
    Mixed = 2
}

declare class CDmxAttribute {
    typeName: any;
    type: any;
    value: any;
}

export declare function ceilPowerOfTwo(n: number): number;

export declare class CharacterMaterial extends SourceEngineMaterial {
    diffuseModulation: vec4;
    constructor(params?: any);
    afterProcessProxies(proxyParams: any): void;
    clone(): CharacterMaterial;
    get shaderSource(): string;
}

export declare const CHILD_ADDED = "childadded";

export declare const CHILD_REMOVED = "childremoved";

export declare type ChildAddedEventData = {
    child: Entity;
    parent: Entity | null;
};

export declare type ChildRemovedEventData = ChildAddedEventData;

export declare class ChoreographiesManager {
    #private;
    constructor();
    init(repositoryName: any, fileName: any): Promise<void>;
    playChoreography(choreoName: any, actors: any, onStop?: any): Promise<void>;
    getChoreography(choreoName: string): Promise<Choreography | null>;
    step(elapsed: any): void;
    reset(): void;
    stopAll(): void;
    play(): void;
    pause(): void;
    set playbackSpeed(playbackSpeed: any);
}

declare class Choreography {
    #private;
    actors2: any[];
    previousTime: number;
    currentTime: number;
    animsSpeed: number;
    shouldLoop: boolean;
    sceneLength: number;
    onStop: () => void;
    constructor(repository: string, name?: string);
    getRepository(): any;
    /**
     * Add an event
     * @param {Object ChoreographyEvent} event The event to add
         */
     addEvent(event: any): void;
     /**
      * Add an actor
      * @param {Object ChoreographyActor} actor The actor to add
          */
      addActor(actor: any): void;
      /**
       * toString
       */
      toString(indent?: string): string;
      /**
       * Step
       */
      step(delta: any): boolean;
      /**
       * Reset
       */
      reset(): void;
      /**
       * Stop
       */
      stop(): void;
      /**
       * Step
       */
      loop(startTime: any): void;
      /**
       * Step
       */
      setActors(actors: any): void;
      toTimelineElement(): TimelineElement;
     }

     export declare class Circle extends LineSegments {
         #private;
         constructor(params?: any);
         toJSON(): any;
         static constructFromJSON(json: any, entities: any, loadedPromise: any): Promise<Circle>;
         static getEntityName(): string;
     }

     export declare class Clamp extends Proxy_2 {
         #private;
         init(variables: any): void;
         execute(variables: any): void;
     }

     export declare function clamp(val: number, min: number, max: number): number;

     export declare class ClearPass extends Pass {
         #private;
         swapBuffers: boolean;
         constructor(clearColor: any, clearDepth: any, clearStencil: any);
         set clearColor(clearColor: vec4);
         set clearDepth(clearDepth: any);
         set clearStencil(clearStencil: any);
         render(renderer: any, readBuffer: any, writeBuffer: any, renderToScreen: any): void;
     }

     export declare const COLLISION_GROUP_DEBRIS = 1;

     export declare const COLLISION_GROUP_NONE = 0;

     export declare class CollisionViaTraces extends SourceEngineParticleOperator {
         #private;
         static functionName: string;
         constructor();
         paramChanged(name: any, value: any): void;
         applyConstraint(particle: any): void;
     }

     declare class Color {
         r: number;
         g: number;
         b: number;
         a: number;
         constructor(r?: number, g?: number, b?: number, a?: number);
         randomize(color1: Color, color2: Color): void;
         setColor(color: Color): this;
         setColorAlpha(color: Color): this;
         fromVec3(v: vec3): this;
         fromVec4(v: vec4): this;
         getRed(): number;
         getGreen(): number;
         getBlue(): number;
         getAlpha(): number;
         setRed: (r: number) => void;
         setGreen: (g: number) => void;
         setBlue: (b: number) => void;
         toString(): string;
         setWhite(): void;
     }

     export declare class ColorBackground extends BackGround {
         #private;
         constructor(params?: any);
         render(renderer: Renderer, camera: Camera): void;
         setColor(color: vec4): void;
         getColor(out?: vec4): void;
         dispose(): void;
         is(s: string): boolean;
     }

     export declare class ColorFade extends SourceEngineParticleOperator {
         static functionName: string;
         constructor();
         doOperate(particle: any, elapsedTime: any): void;
     }

     export declare class ColorInterpolate extends Operator {
         colorFade: vec3;
         fadeStartTime: number;
         fadeEndTime: number;
         easeInAndOut: boolean;
         fieldOutput: any;
         invTime: number;
         constructor(system: any);
         _update(): void;
         _paramChanged(paramName: any, value: any): void;
         doOperate(particle: any, elapsedTime: any): void;
     }

     export declare class ColorRandom extends SourceEngineParticleOperator {
         static functionName: string;
         constructor();
         doInit(particle: any, elapsedTime: any): void;
     }

     export declare enum ColorSpace {
         None = 0,
         Linear = 1,
         Srgb = 2,
         SrgbLinear = 3
     }

     export declare class CombineAdd extends Node_2 {
         #private;
         constructor(editor: NodeImageEditor, params?: any);
         operate(context?: any): Promise<void>;
         get title(): string;
         dispose(): void;
     }

     export declare class CombineLerp extends Node_2 {
         #private;
         constructor(editor: NodeImageEditor, params?: any);
         operate(context?: any): Promise<void>;
         get title(): string;
         dispose(): void;
     }

     export declare class CommunityWeapon extends Proxy_2 {
     }

     export declare class Composer {
         #private;
         enabled: boolean;
         passes: Array<Pass>;
         renderTarget1: RenderTarget;
         renderTarget2: RenderTarget;
         readBuffer: RenderTarget;
         writeBuffer: RenderTarget;
         constructor(renderTarget?: RenderTarget);
         render(delta: any): void;
         savePicture(filename: any, width: any, height: any): void;
         addPass(pass: any): void;
         setSize(width: any, height: any): void;
     }

     export declare class Cone extends Mesh {
         #private;
         constructor(params?: any);
         buildContextMenu(): {
             visibility: {
                 i18n: string;
                 selected: boolean;
                 f: () => void;
             };
             remove: {
                 i18n: string;
                 f: () => void;
             };
             destroy: {
                 i18n: string;
                 f: () => void;
             };
             remove_more: {
                 i18n: string;
                 submenu: {
                     i18n: string;
                     f: () => void;
                 }[];
             };
             name: {
                 i18n: string;
                 f: () => void;
             };
             add: {
                 i18n: string;
                 submenu: any;
             };
             entitynull_1: any;
             position: {
                 i18n: string;
                 f: () => void;
             };
             translate: {
                 i18n: string;
                 f: () => void;
             };
             reset_position: {
                 i18n: string;
                 f: () => vec3;
             };
             entitynull_2: any;
             quaternion: {
                 i18n: string;
                 f: () => void;
             };
             rotate: {
                 i18n: string;
                 submenu: {
                     i18n: string;
                     f: () => void;
                 }[];
             };
             reset_rotation: {
                 i18n: string;
                 f: () => quat;
             };
             entitynull_3: any;
             scale: {
                 i18n: string;
                 f: () => void;
             };
             reset_scale: {
                 i18n: string;
                 f: () => vec3;
             };
             entitynull_4: any;
             wireframe: {
                 i18n: string;
                 selected: boolean;
                 f: () => void;
             };
             cast_shadows: {
                 i18n: string;
                 selected: boolean;
                 f: () => void;
             };
             receive_shadows: {
                 i18n: string;
                 selected: boolean;
                 f: () => void;
             };
             material: {
                 i18n: string;
                 submenu: {};
             };
         } & {
             Cone_1: any;
             radius: {
                 i18n: string;
                 f: () => void;
             };
             height: {
                 i18n: string;
                 f: () => void;
             };
         };
         static getEntityName(): string;
     }

     export declare class ConstrainDistance extends Operator {
         minDistance: number;
         maxDistance: number;
         scaleCP: number;
         centerOffset: vec3;
         globalCenter: boolean;
         _paramChanged(paramName: any, value: any): void;
         applyConstraint(particle: any): void;
     }

     export declare class ConstrainDistanceToControlPoint extends SourceEngineParticleOperator {
         static functionName: string;
         constructor();
         applyConstraint(particle: any): void;
     }

     export declare class ConstrainDistanceToPathBetweenTwoControlPoints extends SourceEngineParticleOperator {
         static functionName: string;
         constructor();
         applyConstraint(particle: any): void;
     }

     export declare const ContextObserver: ContextObserverClass;

     declare class ContextObserverClass {
         #private;
         constructor();
         handleEvent(event: any): void;
         observe(subject: any, dependent: any): void;
         unobserve(subject: any, dependent: any): void;
     }

     export declare class ContinuousEmitter extends Operator {
         emitRate: number;
         remainder: number;
         _paramChanged(paramName: any, value: any): void;
         doEmit(elapsedTime: any): void;
     }

     export declare class ControlPoint extends Entity {
         #private;
         isControlPoint: boolean;
         currentWorldPosition: vec3;
         prevWorldPosition: vec3;
         deltaWorldPosition: vec3;
         currentWorldQuaternion: quat;
         prevWorldQuaternion: quat;
         currentWorldTransformation: mat4;
         prevWorldTransformation: mat4;
         deltaWorldTransformation: mat4;
         fVector: vec3;
         uVector: vec3;
         rVector: vec3;
         parentModel: any;
         lastComputed: number;
         getWorldTransformation(mat?: mat4): mat4;
         getWorldQuaternion(q?: quat): quat;
         parentChanged(parent: Entity | null): void;
         set parentControlPoint(parentControlPoint: ControlPoint);
         get parentControlPoint(): ControlPoint;
         step(): void;
         resetDelta(): void;
         deltaPosFrom(other: ControlPoint, out?: vec3): vec3;
         static constructFromJSON(json: JSONObject): Promise<ControlPoint>;
         static getEntityName(): string;
     }

     export declare class CopyPass extends Pass {
         constructor(camera: Camera);
         render(renderer: any, readBuffer: any, writeBuffer: any, renderToScreen: any): void;
     }

     export declare const CParticleSystemDefinition = "CParticleSystemDefinition";

     export declare class CPVelocityForce extends Operator {
         _paramChanged(paramName: any, value: any): void;
         doForce(particle: any, elapsedTime: any, accumulatedForces: any, strength?: number): void;
     }

     export declare class CreateFromParentParticles extends Operator {
         velocityScale: number;
         increment: number;
         randomDistribution: boolean;
         randomSeed: number;
         subFrame: boolean;
         _paramChanged(paramName: any, value: any): void;
         doInit(particle: any, elapsedTime: any): void;
     }

     export declare class CreateOnModel extends Operator {
         forceInModel: number;
         desiredHitbox: number;
         hitboxValueFromControlPointIndex: number;
         boneVelocity: number;
         maxBoneVelocity: number;
         directionBias: vec3;
         hitboxSetName: string;
         localCoords: boolean;
         useBones: boolean;
         _paramChanged(paramName: any, value: any): void;
         doInit(particle: any, elapsedTime: any): void;
     }

     export declare class CreateSequentialPath extends Operator {
         numToAssign: number;
         step: number;
         loop: boolean;
         maxDistance: number;
         cpPairs: boolean;
         saveOffset: boolean;
         startControlPointNumber: number;
         endControlPointNumber: number;
         bulgeControl: number;
         bulge: number;
         midPoint: number;
         startPointOffset: vec3;
         midPointOffset: vec3;
         endOffset: vec3;
         t: number;
         _paramChanged(paramName: any, value: any): void;
         doInit(particle: any, elapsedTime: any): void;
     }

     export declare function createTexture(): WebGLTexture | null;

     export declare class CreateWithinBox extends Operator {
         vecMin: vec3;
         vecMax: vec3;
         localSpace: boolean;
         scaleCP: number;
         _paramChanged(paramName: any, value: any): void;
         doInit(particle: any, elapsedTime: any): void;
     }

     export declare class CreateWithinSphere extends Operator {
         distanceBias: vec3;
         distanceBiasAbs: vec3;
         speedRandExp: number;
         localCoords: boolean;
         _paramChanged(paramName: any, value: any): void;
         doInit(particle: any, elapsedTime: any): void;
     }

     export declare class CreationNoise extends Operator {
         fieldOutput: number;
         absVal: boolean;
         absValInv: boolean;
         offset: number;
         outputMin: number;
         outputMax: number;
         noiseScale: number;
         noiseScaleLoc: number;
         offsetLoc: vec3;
         worldTimeScale: number;
         _paramChanged(paramName: any, value: any): void;
         doInit(particle: any, elapsedTime: any): void;
     }

     export declare class CrosshatchPass extends Pass {
         constructor(camera: any);
         render(renderer: any, readBuffer: any, writeBuffer: any, renderToScreen: any): void;
     }

     export declare class CubeBackground extends BackGround {
         #private;
         constructor(params?: any);
         render(renderer: Renderer, camera: Camera): void;
         setTexture(texture: Texture): void;
         dispose(): void;
         is(s: string): boolean;
     }

     export declare class CubeEnvironment extends Environment {
         texture: Texture;
         constructor();
     }

     export declare class CubeTexture extends Texture {
         #private;
         isCubeTexture: boolean;
         constructor(parameters: any);
         setImages(images?: Array<HTMLImageElement>): void;
         getImages(): Array<HTMLImageElement> | undefined;
         getWidth(): number;
         getHeight(): number;
         is(type: string): boolean;
     }

     export declare class CubicBezierCurve extends Curve {
         p0: vec3;
         p1: vec3;
         p2: vec3;
         p3: vec3;
         constructor(p0?: vec3, p1?: vec3, p2?: vec3, p3?: vec3);
         getPosition(t: any, out?: vec3): vec3;
     }

     declare class Curve {
         controlPoints: any[];
         arcLength: number;
         getPosition(t: any, out?: vec3): vec3;
         getArcLength(divisions?: number): number;
         getPoints(divisions?: number): any[];
         getAppropriateDivision(division: any): any;
     }

     export declare function customFetch(resource: string | URL | Request, options?: RequestInit): Promise<Response>;

     /**
      * CustomSteamImageOnModel proxy.
      * @comment ouput variable name: resultVar
      */
     export declare class CustomSteamImageOnModel extends Proxy_2 {
         #private;
         setParams(datas: any): void;
         init(): void;
         execute(variables: any, proxyParams: any): void;
     }

     export declare class CustomWeaponMaterial extends SourceEngineMaterial {
         diffuseModulation: vec4;
         constructor(params?: any);
         afterProcessProxies(proxyParams: any): void;
         set style(style: any);
         setColorUniform(uniformName: any, value: any): void;
         set color0(color: any);
         set color1(color: any);
         set color2(color: any);
         set color3(color: any);
         setPatternScale(scale: any): void;
         clone(): CustomWeaponMaterial;
         get shaderSource(): string;
     }

     export declare class Cylinder extends Mesh {
         #private;
         constructor(params?: any);
         buildContextMenu(): {
             visibility: {
                 i18n: string;
                 selected: boolean;
                 f: () => void;
             };
             remove: {
                 i18n: string;
                 f: () => void;
             };
             destroy: {
                 i18n: string;
                 f: () => void;
             };
             remove_more: {
                 i18n: string;
                 submenu: {
                     i18n: string;
                     f: () => void;
                 }[];
             };
             name: {
                 i18n: string;
                 f: () => void;
             };
             add: {
                 i18n: string;
                 submenu: any;
             };
             entitynull_1: any;
             position: {
                 i18n: string;
                 f: () => void;
             };
             translate: {
                 i18n: string;
                 f: () => void;
             };
             reset_position: {
                 i18n: string;
                 f: () => vec3;
             };
             entitynull_2: any;
             quaternion: {
                 i18n: string;
                 f: () => void;
             };
             rotate: {
                 i18n: string;
                 submenu: {
                     i18n: string;
                     f: () => void;
                 }[];
             };
             reset_rotation: {
                 i18n: string;
                 f: () => quat;
             };
             entitynull_3: any;
             scale: {
                 i18n: string;
                 f: () => void;
             };
             reset_scale: {
                 i18n: string;
                 f: () => vec3;
             };
             entitynull_4: any;
             wireframe: {
                 i18n: string;
                 selected: boolean;
                 f: () => void;
             };
             cast_shadows: {
                 i18n: string;
                 selected: boolean;
                 f: () => void;
             };
             receive_shadows: {
                 i18n: string;
                 selected: boolean;
                 f: () => void;
             };
             material: {
                 i18n: string;
                 submenu: {};
             };
         } & {
             Cylinder_1: any;
             radius: {
                 i18n: string;
                 f: () => void;
             };
             height: {
                 i18n: string;
                 f: () => void;
             };
             segments: {
                 i18n: string;
                 f: () => void;
             };
             hasCap: {
                 i18n: string;
                 f: () => void;
             };
         };
         toJSON(): any;
         static constructFromJSON(json: any, entities: any, loadedPromise: any): Promise<Cylinder>;
         static getEntityName(): string;
     }

     export declare class DampenToCP extends Operator {
         range: number;
         scale: number;
         _paramChanged(paramName: any, value: any): void;
         doOperate(particle: any, elapsedTime: any): void;
     }

     export declare class Decal extends Mesh {
         #private;
         constructor(params?: any);
         set position(position: vec3);
         get position(): vec3;
         parentChanged(parent: any): void;
         setSize(size: vec3): void;
         get size(): vec3;
         refreshGeometry(): void;
         buildContextMenu(): {
             visibility: {
                 i18n: string;
                 selected: boolean;
                 f: () => void;
             };
             remove: {
                 i18n: string;
                 f: () => void;
             };
             destroy: {
                 i18n: string;
                 f: () => void;
             };
             remove_more: {
                 i18n: string;
                 submenu: {
                     i18n: string;
                     f: () => void;
                 }[];
             };
             name: {
                 i18n: string;
                 f: () => void;
             };
             add: {
                 i18n: string;
                 submenu: any;
             };
             entitynull_1: any;
             position: {
                 i18n: string;
                 f: () => void;
             };
             translate: {
                 i18n: string;
                 f: () => void;
             };
             reset_position: {
                 i18n: string;
                 f: () => vec3;
             };
             entitynull_2: any;
             quaternion: {
                 i18n: string;
                 f: () => void;
             };
             rotate: {
                 i18n: string;
                 submenu: {
                     i18n: string;
                     f: () => void;
                 }[];
             };
             reset_rotation: {
                 i18n: string;
                 f: () => quat;
             };
             entitynull_3: any;
             scale: {
                 i18n: string;
                 f: () => void;
             };
             reset_scale: {
                 i18n: string;
                 f: () => vec3;
             };
             entitynull_4: any;
             wireframe: {
                 i18n: string;
                 selected: boolean;
                 f: () => void;
             };
             cast_shadows: {
                 i18n: string;
                 selected: boolean;
                 f: () => void;
             };
             receive_shadows: {
                 i18n: string;
                 selected: boolean;
                 f: () => void;
             };
             material: {
                 i18n: string;
                 submenu: {};
             };
         } & {
             StaticDecal_1: any;
             size: {
                 i18n: string;
                 f: () => void;
             };
             refresh: {
                 i18n: string;
                 f: () => void;
             };
         };
         static constructFromJSON(json: any): Promise<Decal>;
         static getEntityName(): string;
     }

     export declare function decodeLz4(reader: BinaryReader, decompressBlobArray: Uint8Array, compressedSize: number, uncompressedSize: number, outputIndex?: number): number;

     export declare const DEFAULT_TEXTURE_SIZE = 512;

     export declare const DEG_TO_RAD: number;

     export declare function degToRad(deg: number): number;

     export declare function deleteTexture(texture: WebGLTexture | null): void;

     export declare class Detex {
         #private;
         static decodeBC1(width: number, height: number, input: Uint8Array, output: Uint8Array): Promise<void>;
         static decodeBC2(width: number, height: number, input: Uint8Array, output: Uint8Array): Promise<void>;
         static decodeBC3(width: number, height: number, input: Uint8Array, output: Uint8Array): Promise<void>;
         static decodeBC4(width: number, height: number, input: Uint8Array, output: Uint8Array): Promise<void>;
         static decodeBC7(width: number, height: number, input: Uint8Array, output: Uint8Array): Promise<void>;
         static getWebAssembly(): Promise<any>;
     }

     export declare class DistanceBetweenCPs extends Operator {
         fieldOutput: number;
         startCP: number;
         endCP: number;
         maxTraceLength: number;
         losScale: number;
         collisionGroupName: string;
         los: boolean;
         setMethod: any;
         _paramChanged(paramName: any, value: any): void;
         doOperate(particle: any, elapsedTime: any): void;
     }

     export declare class DistanceCull extends Operator {
         pointOffset: vec3;
         distance: number;
         cullInside: boolean;
         _paramChanged(paramName: any, value: any): void;
         doOperate(particle: any, elapsedTime: any): void;
     }

     export declare class DistanceToCP extends Operator {
         fieldOutput: number;
         inputMin: number;
         inputMax: number;
         outputMin: number;
         outputMax: number;
         startCP: number;
         los: boolean;
         collisionGroupName: string;
         maxTraceLength: number;
         losScale: number;
         setMethod: any;
         activeRange: boolean;
         additive: boolean;
         scaleInitialRange: boolean;
         outputMin1: any;
         outputMax1: any;
         _update(): void;
         _paramChanged(paramName: any, value: any): void;
         doOperate(particle: any, elapsedTime: any, flStrength?: number): void;
     }

     /**
      * Divide proxy. Copies the value of a variable to another.
      * @comment input variable name: srcvar1
      * @comment input variable name: srcvar2
      * @comment ouput variable name: resultVar
      */
     export declare class Divide extends Proxy_2 {
         init(variables: any): void;
         execute(variables: any): void;
     }

     export declare class DrawCircle extends Node_2 {
         #private;
         constructor(editor: NodeImageEditor, params?: any);
         operate(context?: any): Promise<void>;
         get title(): string;
         dispose(): void;
     }

     /**
      * DummyEntity
      */
     export declare class DummyEntity extends MapEntity {
         constructor(classname: any);
         setKeyValues(kvElement: any): void;
     }

     export declare class EmitContinuously extends SourceEngineParticleOperator {
         static functionName: string;
         remainder: number;
         constructor();
         doEmit(elapsedTime: number): void;
         finished(): boolean;
     }

     /**
      *TODO
      */
     export declare class EmitInstantaneously extends SourceEngineParticleOperator {
         static functionName: string;
         emitted: boolean;
         constructor();
         doEmit(elapsedTime: any): void;
         reset(): void;
         finished(): boolean;
     }

     export declare class EmitNoise extends SourceEngineParticleOperator {
         static functionName: string;
         remainder: number;
         constructor();
         doEmit(elapsedTime: any): void;
     }

     export declare class Entity {
         #private;
         static addSubMenu: any;
         id: string;
         enumerable: boolean;
         animable: boolean;
         resetable: boolean;
         _position: vec3;
         _quaternion: quat;
         _scale: vec3;
         _mvMatrix: mat4;
         _normalMatrix: mat3;
         _parent: Entity | null;
         materialsParams: any;
         isRenderable: boolean;
         lockPos: boolean;
         lockRot: boolean;
         lockScale: boolean;
         drawOutline: boolean;
         locked: boolean;
         static editMaterial: (entity: Entity) => void;
         readonly properties: Map<string, any>;
         loadedPromise?: Promise<any>;
         constructor(params?: any);
         setParameters(parameters?: any): void;
         set name(name: string);
         get name(): string;
         setPosition(position: vec3): void;
         getPosition(position?: vec3): vec3;
         set position(position: vec3);
         get position(): vec3;
         getWorldPosition(vec?: vec3): vec3;
         getPositionFrom(other: Entity, vec?: vec3): vec3;
         setWorldPosition(position: vec3): void;
         getWorldQuaternion(q?: quat): quat;
         setWorldQuaternion(quaternion: quat): void;
         getWorldScale(vec?: vec3): vec3;
         get positionAsString(): string;
         setQuaternion(quaternion: quat): void;
         getQuaternion(quaternion?: quat): vec4;
         set quaternion(quaternion: quat);
         get quaternion(): quat;
         get quaternionAsString(): string;
         set scale(scale: vec3);
         get scale(): vec3;
         get worldMatrix(): mat4;
         render(canvas: HTMLCanvasElement): void;
         get transparent(): boolean;
         setVisible(visible: boolean | undefined): void;
         /**
          * @deprecated Please use `setVisible` instead.
          */
         set visible(visible: boolean);
         isVisible(): boolean;
         isVisibleSelf(): boolean | undefined;
         /**
          * @deprecated Please use `isVisible` instead.
          */
         get visible(): boolean;
         /**
          * @deprecated Please use `isVisibleSelf` instead.
          */
         get visibleSelf(): boolean;
         toggleVisibility(): void;
         setPlaying(playing: boolean): void;
         isPlaying(): boolean;
         togglePlaying(): void;
         do(action: string, params?: any): void;
         parentChanged(parent: Entity | null): void;
         getParentIterator(): Generator<Entity, any, unknown>;
         remove(): void;
         removeThis(): void;
         removeChildren(): void;
         disposeChildren(): void;
         removeSiblings(): void;
         removeSimilarSiblings(): void;
         set parent(parent: Entity | null);
         get parent(): Entity | null;
         get root(): Entity;
         addChild(child?: Entity | null): Entity;
         addChilds(...childs: Array<Entity>): void;
         isParent(parent: Entity): boolean;
         removeChild(child?: Entity | null): void;
         toString(): string;
         translate(v: vec3): void;
         translateOnAxis(axis: vec3, distance: number): this;
         translateX(distance: number): this;
         translateY(distance: number): this;
         translateZ(distance: number): this;
         rotateX(rad: number): void;
         rotateY(rad: number): void;
         rotateZ(rad: number): void;
         rotateGlobalX(rad: number): void;
         rotateGlobalY(rad: number): void;
         rotateGlobalZ(rad: number): void;
         /**
          * Makes this object look at the specified location.
          *
          * @param {Float32Array(3)} target Point in space to look at.
              *
              * @return {void}.
              */
          lookAt(target: vec3, upVector?: any): void;
          getMeshList(): Set<Entity>;
          showOutline(show: boolean, color?: vec4): void;
          getAllChilds(includeSelf: boolean): Set<unknown>;
          getBoundsModelSpace(min?: vec3, max?: vec3): void;
          getBoundingBox(boundingBox?: BoundingBox): BoundingBox;
          getParentModel(): undefined | Entity;
          getChildList(type?: string): Set<Entity>;
          forEach(callback: (ent: Entity) => void): void;
          forEachVisible(callback: (ent: Entity) => void): void;
          forEachParent(callback: (ent: Entity) => void): void;
          setupPickingId(): void;
          get pickingColor(): vec3 | undefined;
          update(scene: Scene, camera: Camera, delta: number): void;
          set castShadow(castShadow: boolean | undefined);
          get castShadow(): boolean | undefined;
          toggleCastShadow(): void;
          set receiveShadow(receiveShadow: boolean | undefined);
          get receiveShadow(): boolean;
          toggleReceiveShadow(): void;
          set serializable(serializable: boolean);
          get serializable(): boolean;
          set hideInExplorer(hideInExplorer: boolean);
          get hideInExplorer(): boolean;
          buildContextMenu(): {
              visibility: {
                  i18n: string;
                  selected: boolean;
                  f: () => void;
              };
              remove: {
                  i18n: string;
                  f: () => void;
              };
              destroy: {
                  i18n: string;
                  f: () => void;
              };
              remove_more: {
                  i18n: string;
                  submenu: {
                      i18n: string;
                      f: () => void;
                  }[];
              };
              name: {
                  i18n: string;
                  f: () => void;
              };
              add: {
                  i18n: string;
                  submenu: any;
              };
              entitynull_1: any;
              position: {
                  i18n: string;
                  f: () => void;
              };
              translate: {
                  i18n: string;
                  f: () => void;
              };
              reset_position: {
                  i18n: string;
                  f: () => vec3;
              };
              entitynull_2: any;
              quaternion: {
                  i18n: string;
                  f: () => void;
              };
              rotate: {
                  i18n: string;
                  submenu: {
                      i18n: string;
                      f: () => void;
                  }[];
              };
              reset_rotation: {
                  i18n: string;
                  f: () => quat;
              };
              entitynull_3: any;
              scale: {
                  i18n: string;
                  f: () => void;
              };
              reset_scale: {
                  i18n: string;
                  f: () => vec3;
              };
              entitynull_4: any;
              wireframe: {
                  i18n: string;
                  selected: boolean;
                  f: () => void;
              };
              cast_shadows: {
                  i18n: string;
                  selected: boolean;
                  f: () => void;
              };
              receive_shadows: {
                  i18n: string;
                  selected: boolean;
                  f: () => void;
              };
              material: {
                  i18n: string;
                  submenu: {};
              };
          };
          raycast(raycaster: Raycaster, intersections: Array<Intersection>): void;
          setWireframe(wireframe: number, recursive?: boolean): void;
          set wireframe(wireframe: number | undefined);
          get wireframe(): number;
          get children(): Set<Entity>;
          toggleWireframe(): void;
          dispose(): void;
          replaceMaterial(material: Material, recursive?: boolean): void;
          resetMaterial(recursive?: boolean): void;
          setAttribute(attributeName: string, attributeValue: any): void;
          getAttribute(attributeName: string, inherited?: boolean): any;
          propagate(): void;
          copy(source: Entity): void;
          getProperty(name: string): any;
          setProperty(name: string, value: any): Map<string, any>;
          toJSON(): any;
          static constructFromJSON(json: JSONObject, entities: Map<string, Entity | Material>, loadedPromise: Promise<void>): Promise<Entity>;
          createChild(entityName: string, parameters: any): Promise<Entity | Material>;
          fromJSON(json: JSONObject): void;
          static getEntityName(): string;
          is(s: string): boolean;
         }

         export declare const ENTITY_DELETED = "entitydeleted";

         export declare type EntityDeletedEventData = {
             entity: Entity;
         };

         export declare const EntityObserver: EntityObserverClass;

         declare class EntityObserverClass {
             #private;
             parentChanged(child: Entity, oldParent: Entity | null, newParent: Entity | null): void;
             childAdded(parent: Entity, child: Entity): void;
             childRemoved(parent: Entity, child: Entity): void;
             entityDeleted(entity: Entity): void;
             propertyChanged(entity: Entity, propertyName: string, oldValue: any, newValue: any): void;
             attributeChanged(entity: Entity, attributeName: string, oldValue: any, newValue: any): void;
             addEventListener(type: string, callback: (evt: CustomEvent<EntityObserverEventsData>) => void, options?: AddEventListenerOptions | boolean): void;
         }

         export declare type EntityObserverEventsData = ParentChangedEventData | ChildAddedEventData | ChildRemovedEventData | EntityDeletedEventData | PropertyChangedEventData | AttributeChangedEventData;

         export declare class Environment {
             constructor();
         }

         export declare const EPSILON = 1e-7;

         /**
          * Equals proxy. Copies the value of a variable to another.
          * @comment input variable name: srcvar1
          * @comment ouput variable name: resultVar
          */
         export declare class Equals extends Proxy_2 {
             execute(variables: any): void;
         }

         export declare function ExponentialDecay(decayTo: number, decayTime: number, dt: number): number;

         export declare function exportToBinaryFBX(entity: any): Promise<ArrayBufferLike>;

         export declare class EyeRefractMaterial extends SourceEngineMaterial {
             #private;
             constructor(params?: any);
             afterProcessProxies(): void;
             beforeRender(camera: Camera): void;
             clone(): EyeRefractMaterial;
             get shaderSource(): string;
         }

         export declare class FadeAndKill extends Operator {
             startAlpha: number;
             startFadeInTime: number;
             endFadeInTime: number;
             startFadeOutTime: number;
             endFadeOutTime: number;
             endAlpha: number;
             forcePreserveParticleOrder: boolean;
             _paramChanged(paramName: any, value: any): void;
             doOperate(particle: any, elapsedTime: any): void;
         }

         export declare class FadeIn extends Operator {
             fadeInTimeMin: number;
             fadeInTimeMax: number;
             fadeInTimeExp: number;
             proportional: boolean;
             fadeInTime: any;
             invFadeInTime: any;
             constructor(system: any);
             _update(): void;
             _paramChanged(paramName: any, value: any): void;
             doOperate(particle: any, elapsedTime: any): void;
         }

         export declare class FadeInSimple extends Operator {
             fadeInTime: number;
             invFadeInTime: number;
             constructor(system: any);
             _update(): void;
             _paramChanged(paramName: any, value: any): void;
             doOperate(particle: any, elapsedTime: any): void;
         }

         export declare class FadeOut extends Operator {
             fadeOutTimeMin: number;
             fadeOutTimeMax: number;
             fadeOutTimeExp: number;
             proportional: boolean;
             fadeOutTime: any;
             startFadeOutTime: any;
             invFadeOutTime: any;
             constructor(system: any);
             _update(): void;
             _paramChanged(paramName: any, value: any): void;
             doOperate(particle: any, elapsedTime: any): void;
         }

         export declare class FadeOutSimple extends Operator {
             fadeOutTime: number;
             startFadeOutTime: any;
             invFadeOutTime: any;
             constructor(system: any);
             _update(): void;
             _paramChanged(paramName: any, value: any): void;
             doOperate(particle: any, elapsedTime: any): void;
         }

         declare type FetchFunction = (resource: string | URL | Request, options?: RequestInit) => Promise<Response>;

         export declare function FileNameFromPath(path: string): string;

         declare type FileSelectorFile = {
             name: string;
             path?: string;
             root?: string;
             files?: Array<FileSelectorFile>;
         };

         export declare function fillCheckerTexture(texture: Texture, color: number[], width: number, height: number, needCubeMap: boolean): Texture;

         export declare function fillFlatTexture(texture: Texture, color: number[], needCubeMap: boolean): Texture;

         export declare function fillNoiseTexture(texture: Texture, width?: number, height?: number, needCubeMap?: boolean): Texture;

         export declare function fillTextureWithImage(texture: Texture, image: HTMLImageElement): void;

         export declare class FirstPersonControl extends CameraControl {
             #private;
             movementSpeed: number;
             lookSpeed: number;
             lookVertical: boolean;
             autoForward: boolean;
             activeLook: boolean;
             heightSpeed: boolean;
             heightCoef: number;
             heightMin: number;
             heightMax: number;
             constrainVertical: boolean;
             verticalMin: number;
             verticalMax: number;
             constructor(camera: Camera);
             update(delta?: number): void;
             contextmenu(event: any): void;
             setupCamera(): void;
             handleEnabled(): void;
         }

         declare class FlexController {
             controllers: {
                 [key: string]: {
                     i: number;
                     min: number;
                     max: number;
                 };
             };
             controllers2: {};
             controllerIndex: number;
             getController(name: any, min: any, max: any): number;
             getControllers(): {
                 [key: string]: {
                     i: number;
                     min: number;
                     max: number;
                 };
             };
             getControllerValue(name: any): any;
             getControllerRealValue(name: any): number;
             setControllerValue(name: any, value: any): void;
             setAllValues(value: any): void;
             removeAllControllers(): void;
         }

         export declare function flipPixelArray(pixelArray: Uint8ClampedArray, width: number, height: number): void;

         export declare class Float32BufferAttribute extends BufferAttribute {
             constructor(array: typeof TypedArrayProto, itemSize: number, offset?: number, length?: number);
         }

         export declare class FloatArrayNode extends ParametersNode {
             #private;
             constructor(editor: any, params: any);
             operate(context?: any): Promise<void>;
             get title(): string;
             setValue(index: any, value: any): void;
         }

         export declare const FLT_EPSILON = 1.1920929e-7;

         export declare class FontManager {
             #private;
             static setFontsPath(url: URL): void;
             static getFont(name: string, style?: string): Promise<any>;
             static getFontList(): Promise<string[][]>;
         }

         declare class ForwardRenderer extends Renderer {
             #private;
             constructor(graphics: Graphics);
             applyMaterial(program: Program, material: Material): void;
             render(scene: Scene, camera: Camera, delta: number): void;
             set scissorTest(scissorTest: any);
         }

         export declare class Framebuffer {
             #private;
             constructor(target: FrameBufferTarget);
             addRenderbuffer(attachmentPoint: number, renderbuffer: Renderbuffer): void;
             addTexture2D(attachmentPoint: number, textureTarget: GLenum, texture: Texture): void;
             bind(): void;
             dispose(): void;
         }

         export declare const FRAMEBUFFER_ATTACHMENT_COLOR_ENCODING = 33296;

         export declare enum FrameBufferTarget {
             FrameBuffer = 36160,
             DrawFrameBuffer = 36009,
             ReadFrameBuffer = 36008
         }

         export declare class FullScreenQuad extends Mesh {
             constructor(params?: any);
         }

         export declare function generateRandomUUID(): string;

         export declare function getHelper(type: any): PointLightHelper | SpotLightHelper | CameraFrustum | Grid;

         export declare function getIncludeList(): MapIterator<string>;

         export declare function getIncludeSource(name: string): string;

         export declare function getRandomInt(max: any): number;

         export declare const GL_ALPHA = 6406;

         export declare const GL_ALWAYS = 519;

         export declare const GL_ARRAY_BUFFER = 34962;

         export declare const GL_BACK = 1029;

         export declare const GL_BLEND = 3042;

         export declare const GL_BLUE = 6405;

         export declare const GL_BOOL = 35670;

         export declare const GL_BOOL_VEC2 = 35671;

         export declare const GL_BOOL_VEC3 = 35672;

         export declare const GL_BOOL_VEC4 = 35673;

         export declare const GL_BYTE = 5120;

         export declare const GL_CCW = 2305;

         export declare const GL_CLAMP_TO_EDGE = 33071;

         export declare const GL_COLOR_ATTACHMENT0 = 36064;

         export declare const GL_COLOR_ATTACHMENT1 = 36065;

         export declare const GL_COLOR_ATTACHMENT10 = 36074;

         export declare const GL_COLOR_ATTACHMENT11 = 36075;

         export declare const GL_COLOR_ATTACHMENT12 = 36076;

         export declare const GL_COLOR_ATTACHMENT13 = 36077;

         export declare const GL_COLOR_ATTACHMENT14 = 36078;

         export declare const GL_COLOR_ATTACHMENT15 = 36079;

         export declare const GL_COLOR_ATTACHMENT16 = 36080;

         export declare const GL_COLOR_ATTACHMENT17 = 36081;

         export declare const GL_COLOR_ATTACHMENT18 = 36082;

         export declare const GL_COLOR_ATTACHMENT19 = 36083;

         export declare const GL_COLOR_ATTACHMENT2 = 36066;

         export declare const GL_COLOR_ATTACHMENT20 = 36084;

         export declare const GL_COLOR_ATTACHMENT21 = 36085;

         export declare const GL_COLOR_ATTACHMENT22 = 36086;

         export declare const GL_COLOR_ATTACHMENT23 = 36087;

         export declare const GL_COLOR_ATTACHMENT24 = 36088;

         export declare const GL_COLOR_ATTACHMENT25 = 36089;

         export declare const GL_COLOR_ATTACHMENT26 = 36090;

         export declare const GL_COLOR_ATTACHMENT27 = 36091;

         export declare const GL_COLOR_ATTACHMENT28 = 36092;

         export declare const GL_COLOR_ATTACHMENT29 = 36093;

         export declare const GL_COLOR_ATTACHMENT3 = 36067;

         export declare const GL_COLOR_ATTACHMENT30 = 36094;

         export declare const GL_COLOR_ATTACHMENT31 = 36095;

         export declare const GL_COLOR_ATTACHMENT4 = 36068;

         export declare const GL_COLOR_ATTACHMENT5 = 36069;

         export declare const GL_COLOR_ATTACHMENT6 = 36070;

         export declare const GL_COLOR_ATTACHMENT7 = 36071;

         export declare const GL_COLOR_ATTACHMENT8 = 36072;

         export declare const GL_COLOR_ATTACHMENT9 = 36073;

         export declare const GL_COLOR_BUFFER_BIT = 16384;

         export declare const GL_CONSTANT_ALPHA = 32771;

         export declare const GL_CONSTANT_COLOR = 32769;

         export declare const GL_COPY_READ_BUFFER = 36662;

         export declare const GL_COPY_WRITE_BUFFER = 36663;

         export declare const GL_CULL_FACE = 2884;

         export declare const GL_CW = 2304;

         export declare const GL_DEPTH24_STENCIL8 = 35056;

         export declare const GL_DEPTH32F_STENCIL8 = 36013;

         export declare const GL_DEPTH_ATTACHMENT = 36096;

         export declare const GL_DEPTH_BUFFER_BIT = 256;

         export declare const GL_DEPTH_COMPONENT = 6402;

         export declare const GL_DEPTH_COMPONENT16 = 33189;

         export declare const GL_DEPTH_COMPONENT24 = 33190;

         export declare const GL_DEPTH_COMPONENT32 = 33191;

         export declare const GL_DEPTH_COMPONENT32F = 36012;

         export declare const GL_DEPTH_STENCIL = 34041;

         export declare const GL_DEPTH_TEST = 2929;

         export declare const GL_DITHER = 3024;

         export declare const GL_DRAW_FRAMEBUFFER = 36009;

         export declare const GL_DST_ALPHA = 772;

         export declare const GL_DST_COLOR = 774;

         export declare const GL_DYNAMIC_COPY = 35050;

         export declare const GL_DYNAMIC_DRAW = 35048;

         export declare const GL_DYNAMIC_READ = 35049;

         export declare const GL_ELEMENT_ARRAY_BUFFER = 34963;

         export declare const GL_EQUAL = 514;

         export declare const GL_FALSE = 0;

         export declare const GL_FLOAT = 5126;

         export declare const GL_FLOAT_32_UNSIGNED_INT_24_8_REV = 36269;

         export declare const GL_FLOAT_MAT2 = 35674;

         export declare const GL_FLOAT_MAT2x3 = 35685;

         export declare const GL_FLOAT_MAT2x4 = 35686;

         export declare const GL_FLOAT_MAT3 = 35675;

         export declare const GL_FLOAT_MAT3x2 = 35687;

         export declare const GL_FLOAT_MAT3x4 = 35688;

         export declare const GL_FLOAT_MAT4 = 35676;

         export declare const GL_FLOAT_MAT4x2 = 35689;

         export declare const GL_FLOAT_MAT4x3 = 35690;

         export declare const GL_FLOAT_VEC2 = 35664;

         export declare const GL_FLOAT_VEC3 = 35665;

         export declare const GL_FLOAT_VEC4 = 35666;

         export declare const GL_FRAGMENT_SHADER = 35632;

         export declare const GL_FRAMEBUFFER = 36160;

         export declare const GL_FRONT = 1028;

         export declare const GL_FRONT_AND_BACK = 1032;

         export declare const GL_FUNC_ADD = 32774;

         export declare const GL_FUNC_REVERSE_SUBTRACT = 32779;

         export declare const GL_FUNC_SUBTRACT = 32778;

         export declare const GL_GEQUAL = 518;

         export declare const GL_GREATER = 516;

         export declare const GL_GREEN = 6404;

         export declare const GL_HALF_FLOAT = 5131;

         export declare const GL_HALF_FLOAT_OES = 36193;

         export declare const GL_INT = 5124;

         export declare const GL_INT_SAMPLER_2D = 36298;

         export declare const GL_INT_SAMPLER_2D_ARRAY = 36303;

         export declare const GL_INT_SAMPLER_3D = 36299;

         export declare const GL_INT_SAMPLER_CUBE = 36300;

         export declare const GL_INT_VEC2 = 35667;

         export declare const GL_INT_VEC3 = 35668;

         export declare const GL_INT_VEC4 = 35669;

         export declare const GL_INVALID_ENUM = 1280;

         export declare const GL_INVALID_OPERATION = 1282;

         export declare const GL_INVALID_VALUE = 1281;

         export declare const GL_LEQUAL = 515;

         export declare const GL_LESS = 513;

         export declare const GL_LINE_LOOP = 2;

         export declare const GL_LINE_STRIP = 3;

         export declare const GL_LINEAR = 9729;

         export declare const GL_LINEAR_MIPMAP_LINEAR = 9987;

         export declare const GL_LINEAR_MIPMAP_NEAREST = 9985;

         export declare const GL_LINES = 1;

         export declare const GL_LUMINANCE = 6409;

         export declare const GL_LUMINANCE_ALPHA = 6410;

         export declare const GL_MAX = 32776;

         export declare const GL_MAX_COLOR_ATTACHMENTS = 36063;

         export declare const GL_MAX_EXT = 32776;

         export declare const GL_MAX_RENDERBUFFER_SIZE = 34024;

         export declare const GL_MAX_VERTEX_ATTRIBS = 34921;

         export declare const GL_MIN = 32775;

         export declare const GL_MIN_EXT = 32775;

         export declare const GL_MIRRORED_REPEAT = 33648;

         export declare const GL_NEAREST = 9728;

         export declare const GL_NEAREST_MIPMAP_LINEAR = 9986;

         export declare const GL_NEAREST_MIPMAP_NEAREST = 9984;

         export declare const GL_NEVER = 512;

         export declare const GL_NO_ERROR = 0;

         export declare const GL_NONE = 0;

         export declare const GL_NOTEQUAL = 517;

         export declare const GL_ONE = 1;

         export declare const GL_ONE_MINUS_CONSTANT_ALPHA = 32772;

         export declare const GL_ONE_MINUS_CONSTANT_COLOR = 32770;

         export declare const GL_ONE_MINUS_DST_ALPHA = 773;

         export declare const GL_ONE_MINUS_DST_COLOR = 775;

         export declare const GL_ONE_MINUS_SRC_ALPHA = 771;

         export declare const GL_ONE_MINUS_SRC_COLOR = 769;

         export declare const GL_OUT_OF_MEMORY = 1285;

         export declare const GL_PIXEL_PACK_BUFFER = 35051;

         export declare const GL_PIXEL_UNPACK_BUFFER = 35052;

         export declare const GL_POINTS = 0;

         export declare const GL_POLYGON_OFFSET_FILL = 32823;

         export declare const GL_R16I = 33331;

         export declare const GL_R16UI = 33332;

         export declare const GL_R32I = 33333;

         export declare const GL_R32UI = 33334;

         export declare const GL_R8 = 33321;

         export declare const GL_R8_SNORM = 36756;

         export declare const GL_R8I = 33329;

         export declare const GL_R8UI = 33330;

         export declare const GL_RASTERIZER_DISCARD = 35977;

         export declare const GL_READ_FRAMEBUFFER = 36008;

         export declare const GL_RED = 6403;

         export declare const GL_RENDERBUFFER = 36161;

         export declare const GL_REPEAT = 10497;

         export declare const GL_RG16I = 33337;

         export declare const GL_RG16UI = 33338;

         export declare const GL_RG32I = 33339;

         export declare const GL_RG32UI = 33340;

         export declare const GL_RG8 = 33323;

         export declare const GL_RG8I = 33335;

         export declare const GL_RG8UI = 33336;

         export declare const GL_RGB = 6407;

         export declare const GL_RGB10 = 32850;

         export declare const GL_RGB10_A2 = 32857;

         export declare const GL_RGB10_A2UI = 36975;

         export declare const GL_RGB12 = 32851;

         export declare const GL_RGB16 = 32852;

         export declare const GL_RGB16I = 36233;

         export declare const GL_RGB16UI = 36215;

         export declare const GL_RGB32F = 34837;

         export declare const GL_RGB32I = 36227;

         export declare const GL_RGB4 = 32847;

         export declare const GL_RGB5 = 32848;

         export declare const GL_RGB565 = 36194;

         export declare const GL_RGB5_A1 = 32855;

         export declare const GL_RGB8 = 32849;

         export declare const GL_RGBA = 6408;

         export declare const GL_RGBA12 = 32858;

         export declare const GL_RGBA16 = 32859;

         export declare const GL_RGBA16F = 34842;

         export declare const GL_RGBA16I = 36232;

         export declare const GL_RGBA16UI = 36214;

         export declare const GL_RGBA2 = 32853;

         export declare const GL_RGBA32F = 34836;

         export declare const GL_RGBA32I = 36226;

         export declare const GL_RGBA32UI = 36208;

         export declare const GL_RGBA4 = 32854;

         export declare const GL_RGBA8 = 32856;

         export declare const GL_RGBA8I = 36238;

         export declare const GL_RGBA8UI = 36220;

         export declare const GL_SAMPLE_ALPHA_TO_COVERAGE = 32926;

         export declare const GL_SAMPLE_COVERAGE = 32928;

         export declare const GL_SAMPLER_2D = 35678;

         export declare const GL_SAMPLER_2D_ARRAY = 36289;

         export declare const GL_SAMPLER_2D_ARRAY_SHADOW = 36292;

         export declare const GL_SAMPLER_2D_SHADOW = 35682;

         export declare const GL_SAMPLER_3D = 35679;

         export declare const GL_SAMPLER_CUBE = 35680;

         export declare const GL_SAMPLER_CUBE_SHADOW = 36293;

         export declare const GL_SCISSOR_TEST = 3089;

         export declare const GL_SHORT = 5122;

         export declare const GL_SRC_ALPHA = 770;

         export declare const GL_SRC_ALPHA_SATURATE = 776;

         export declare const GL_SRC_COLOR = 768;

         export declare const GL_SRGB = 35904;

         export declare const GL_SRGB8 = 35905;

         export declare const GL_SRGB8_ALPHA8 = 35907;

         export declare const GL_SRGB_ALPHA = 35906;

         export declare const GL_STACK_OVERFLOW = 1283;

         export declare const GL_STACK_UNDERFLOW = 1284;

         export declare const GL_STATIC_COPY = 35046;

         export declare const GL_STATIC_DRAW = 35044;

         export declare const GL_STATIC_READ = 35045;

         export declare const GL_STENCIL_ATTACHMENT = 36128;

         export declare const GL_STENCIL_BUFFER_BIT = 1024;

         export declare const GL_STENCIL_INDEX8 = 36168;

         export declare const GL_STENCIL_TEST = 2960;

         export declare const GL_STREAM_COPY = 35042;

         export declare const GL_STREAM_DRAW = 35040;

         export declare const GL_STREAM_READ = 35041;

         export declare const GL_TEXTURE0 = 33984;

         export declare const GL_TEXTURE_2D = 3553;

         export declare const GL_TEXTURE_2D_ARRAY = 35866;

         export declare const GL_TEXTURE_3D = 32879;

         export declare const GL_TEXTURE_BASE_LEVEL = 33084;

         export declare const GL_TEXTURE_COMPARE_FUNC = 34893;

         export declare const GL_TEXTURE_COMPARE_MODE = 34892;

         export declare const GL_TEXTURE_CUBE_MAP = 34067;

         export declare const GL_TEXTURE_CUBE_MAP_NEGATIVE_X = 34070;

         export declare const GL_TEXTURE_CUBE_MAP_NEGATIVE_Y = 34072;

         export declare const GL_TEXTURE_CUBE_MAP_NEGATIVE_Z = 34074;

         export declare const GL_TEXTURE_CUBE_MAP_POSITIVE_X = 34069;

         export declare const GL_TEXTURE_CUBE_MAP_POSITIVE_Y = 34071;

         export declare const GL_TEXTURE_CUBE_MAP_POSITIVE_Z = 34073;

         export declare const GL_TEXTURE_MAG_FILTER = 10240;

         export declare const GL_TEXTURE_MAX_LEVEL = 33085;

         export declare const GL_TEXTURE_MAX_LOD = 33083;

         export declare const GL_TEXTURE_MIN_FILTER = 10241;

         export declare const GL_TEXTURE_MIN_LOD = 33082;

         export declare const GL_TEXTURE_WRAP_R = 32882;

         export declare const GL_TEXTURE_WRAP_S = 10242;

         export declare const GL_TEXTURE_WRAP_T = 10243;

         export declare const GL_TRANSFORM_FEEDBACK_BUFFER = 35982;

         export declare const GL_TRIANGLE_FAN = 6;

         export declare const GL_TRIANGLE_STRIP = 5;

         export declare const GL_TRIANGLES = 4;

         export declare const GL_TRUE = 1;

         export declare const GL_UNIFORM_BUFFER = 35345;

         export declare const GL_UNPACK_COLORSPACE_CONVERSION_WEBGL = 37443;

         export declare const GL_UNPACK_FLIP_Y_WEBGL = 37440;

         export declare const GL_UNPACK_PREMULTIPLY_ALPHA_WEBGL = 37441;

         export declare const GL_UNSIGNED_BYTE = 5121;

         export declare const GL_UNSIGNED_INT = 5125;

         export declare const GL_UNSIGNED_INT_10F_11F_11F_REV = 35899;

         export declare const GL_UNSIGNED_INT_24_8 = 34042;

         export declare const GL_UNSIGNED_INT_2_10_10_10_REV = 33640;

         export declare const GL_UNSIGNED_INT_5_9_9_9_REV = 35902;

         export declare const GL_UNSIGNED_INT_SAMPLER_2D = 36306;

         export declare const GL_UNSIGNED_INT_SAMPLER_2D_ARRAY = 36311;

         export declare const GL_UNSIGNED_INT_SAMPLER_3D = 36307;

         export declare const GL_UNSIGNED_INT_SAMPLER_CUBE = 36308;

         export declare const GL_UNSIGNED_INT_VEC2 = 36294;

         export declare const GL_UNSIGNED_INT_VEC3 = 36295;

         export declare const GL_UNSIGNED_INT_VEC4 = 36296;

         export declare const GL_UNSIGNED_SHORT = 5123;

         export declare const GL_UNSIGNED_SHORT_4_4_4_4 = 32819;

         export declare const GL_UNSIGNED_SHORT_5_5_5_1 = 32820;

         export declare const GL_UNSIGNED_SHORT_5_6_5 = 33635;

         export declare const GL_VERTEX_ARRAY = 32884;

         export declare const GL_VERTEX_SHADER = 35633;

         export declare const GL_ZERO = 0;

         export declare class GrainPass extends Pass {
             #private;
             constructor(camera: any);
             set intensity(intensity: any);
             render(renderer: any, readBuffer: any, writeBuffer: any, renderToScreen: any): void;
         }

         export declare type GraphicKeyboardEventData = {
             keyboardEvent: KeyboardEvent;
         };

         export declare type GraphicMouseEventData = {
             x: number;
             y: number;
             entity: Entity | null;
             mouseEvent: MouseEvent;
         };

         export declare class Graphics {
             #private;
             isWebGL: boolean;
             isWebGL2: boolean;
             autoClear: boolean;
             autoClearColor: boolean;
             autoClearDepth: boolean;
             autoClearStencil: boolean;
             speed: number;
             currentTick: number;
             glContext?: WebGLAnyRenderingContext;
             ANGLE_instanced_arrays: any;
             OES_texture_float_linear: any;
             dragging: boolean;
             constructor();
             initCanvas(contextAttributes?: GraphicsInitOptions): this;
             pickEntity(x: number, y: number): Entity;
             getDefinesAsString(material: Material): string;
             render(scene: Scene, camera: Camera, delta: number): void;
             renderBackground(): void;
             clear(color: boolean, depth: boolean, stencil: boolean): void;
             _tick(): void;
             set shaderPrecision(shaderPrecision: ShaderPrecision);
             setShaderPrecision(shaderPrecision: ShaderPrecision): void;
             setShaderQuality(shaderQuality: ShaderQuality): void;
             setShaderDebugMode(shaderDebugMode: ShaderDebugMode): void;
             setIncludeCode(key: string, code: string): void;
             removeIncludeCode(key: string): void;
             getIncludeCode(): string;
             /**
              * Invalidate all shader (force recompile)
              */
             invalidateShaders(): void;
             clearColor(clearColor: vec4): void;
             getClearColor(clearColor?: vec4): vec4;
             clearDepth(clearDepth: GLclampf): void;
             clearStencil(clearStencil: GLint): void;
             set autoResize(autoResize: boolean);
             get autoResize(): boolean;
             getExtension(name: string): any;
             set pixelRatio(pixelRatio: number);
             get pixelRatio(): number;
             setSize(width: number, height: number): number[];
             getSize(ret?: vec2): vec2;
             set viewport(viewport: vec4);
             get viewport(): vec4;
             set scissor(scissor: vec4);
             set scissorTest(scissorTest: boolean);
             checkCanvasSize(): void;
             play(): void;
             pause(): void;
             isRunning(): boolean;
             createFramebuffer(): WebGLFramebuffer;
             deleteFramebuffer(frameBuffer: WebGLFramebuffer): void;
             createRenderbuffer(): WebGLRenderbuffer;
             deleteRenderbuffer(renderBuffer: WebGLRenderbuffer): void;
             pushRenderTarget(renderTarget: RenderTarget): void;
             popRenderTarget(): RenderTarget;
             savePicture(scene: Scene, camera: Camera, filename: string, width: number, height: number): void;
             savePictureAsFile(filename: string): Promise<File>;
             toBlob(): Promise<Blob | null>;
             _savePicture(filename: string): Promise<void>;
             startRecording(frameRate: number, bitsPerSecond: number): void;
             stopRecording(fileName?: string): void;
             get ready(): Promise<boolean>;
             isReady(): Promise<void>;
             getParameter(param: GLenum): any;
             cleanupGLError(): void;
             getGLError(context: string): void;
             useLogDepth(use: boolean): void;
             getTime(): number;
             getWidth(): number;
             getHeight(): number;
             getCanvas(): HTMLCanvasElement;
             getForwardRenderer(): ForwardRenderer;
         }

         export declare enum GraphicsEvent {
             MouseMove = "mousemove",
             MouseDown = "mousedown",
             MouseUp = "mouseup",
             Wheel = "wheel",
             Resize = "resize",
             Tick = "tick",
             KeyDown = "keydown",
             KeyUp = "keyup",
             TouchStart = "touchstart",
             TouchMove = "touchmove",
             TouchCancel = "touchcancel"
         }

         export declare const GraphicsEvents: {
             tick(delta: number, time: number): void;
             resize(width: number, height: number): void;
             mouseMove(x: number, y: number, pickedEntity: Entity | null, mouseEvent: MouseEvent): void;
             mouseDown(x: number, y: number, pickedEntity: Entity | null, mouseEvent: MouseEvent): void;
             mouseUp(x: number, y: number, pickedEntity: Entity | null, mouseEvent: MouseEvent): void;
             wheel(x: number, y: number, pickedEntity: Entity | null, wheelEvent: WheelEvent): void;
             keyDown(keyboardEvent: KeyboardEvent): void;
             keyUp(keyboardEvent: KeyboardEvent): void;
             touchStart(pickedEntity: Entity | null, touchEvent: TouchEvent): void;
             touchMove(pickedEntity: Entity | null, touchEvent: TouchEvent): void;
             touchCancel(pickedEntity: Entity | null, touchEvent: TouchEvent): void;
             addEventListener(type: string, callback: EventListenerOrEventListenerObject | null, options?: AddEventListenerOptions | boolean): void;
             dispatchEvent(event: Event): boolean;
             removeEventListener(type: string, callback: EventListenerOrEventListenerObject | null, options?: EventListenerOptions | boolean): void;
         };

         declare type GraphicsInitOptions = {
             canvas?: HTMLCanvasElement;
             autoResize?: boolean;
             webGL?: {
                 alpha?: boolean;
                 depth?: boolean;
                 stencil?: boolean;
                 desynchronized?: boolean;
                 antialias?: boolean;
                 failIfMajorPerformanceCaveat?: boolean;
                 powerPreference?: string;
                 premultipliedAlpha?: boolean;
                 preserveDrawingBuffer?: boolean;
             };
         };

         export declare type GraphicTouchEventData = {
             entity: Entity | null;
             touchEvent: TouchEvent;
         };

         export declare type GraphicWheelEventData = {
             x: number;
             y: number;
             entity: Entity | null;
             wheelEvent: WheelEvent;
         };

         export declare class Grid extends Mesh {
             #private;
             constructor(params?: any);
             buildContextMenu(): {
                 visibility: {
                     i18n: string;
                     selected: boolean;
                     f: () => void;
                 };
                 remove: {
                     i18n: string;
                     f: () => void;
                 };
                 destroy: {
                     i18n: string;
                     f: () => void;
                 };
                 remove_more: {
                     i18n: string;
                     submenu: {
                         i18n: string;
                         f: () => void;
                     }[];
                 };
                 name: {
                     i18n: string;
                     f: () => void;
                 };
                 add: {
                     i18n: string;
                     submenu: any;
                 };
                 entitynull_1: any;
                 position: {
                     i18n: string;
                     f: () => void;
                 };
                 translate: {
                     i18n: string;
                     f: () => void;
                 };
                 reset_position: {
                     i18n: string;
                     f: () => vec3;
                 };
                 entitynull_2: any;
                 quaternion: {
                     i18n: string;
                     f: () => void;
                 };
                 rotate: {
                     i18n: string;
                     submenu: {
                         i18n: string;
                         f: () => void;
                     }[];
                 };
                 reset_rotation: {
                     i18n: string;
                     f: () => quat;
                 };
                 entitynull_3: any;
                 scale: {
                     i18n: string;
                     f: () => void;
                 };
                 reset_scale: {
                     i18n: string;
                     f: () => vec3;
                 };
                 entitynull_4: any;
                 wireframe: {
                     i18n: string;
                     selected: boolean;
                     f: () => void;
                 };
                 cast_shadows: {
                     i18n: string;
                     selected: boolean;
                     f: () => void;
                 };
                 receive_shadows: {
                     i18n: string;
                     selected: boolean;
                     f: () => void;
                 };
                 material: {
                     i18n: string;
                     submenu: {};
                 };
             } & {
                 Grid_1: any;
                 size: {
                     i18n: string;
                     f: () => void;
                 };
                 spacing: {
                     i18n: string;
                     f: () => void;
                 };
             };
         }

         export declare class GRIDCELL {
             p: Array<vec3>;
             val: Float32Array;
             constructor();
         }

         export declare class GridMaterial extends Material {
             constructor(params?: any);
             set spacing(spacing: number);
             getShaderSource(): string;
         }

         export declare class Group extends Entity {
             static constructFromJSON(json: any): Promise<Group>;
             static getEntityName(): string;
         }

         export declare const HALF_PI: number;

         export declare class HeartbeatScale extends Proxy_2 {
             #private;
             setParams(datas: any): void;
             init(): void;
             execute(variables: any, proxyParams: any, time: any): void;
         }

         export declare class HitboxHelper extends Entity {
             #private;
             constructor();
             parentChanged(parent: any): void;
             removeBoxes(): void;
             static constructFromJSON(): Promise<HitboxHelper>;
             static getEntityName(): string;
         }

         export declare function imageDataToImage(imagedata: ImageData, image?: HTMLImageElement): HTMLImageElement;

         export declare const Includes: {
             [key: string]: string;
         };

         export declare class InheritFromParentParticles extends Operator {
             scale: number;
             fieldOutput: number;
             increment: number;
             randomDistribution: boolean;
             randomSeed: number;
             _paramChanged(paramName: any, value: any): void;
             doInit(particle: any, elapsedTime: any): void;
         }

         export declare class InitFloat extends Operator {
             setMethod: any;
             constructor(system: any);
             _paramChanged(paramName: any, value: any): void;
             doInit(particle: any, elapsedTime: any): void;
         }

         export declare class InitFromCPSnapshot extends Operator {
             attributeToRead: number;
             attributeToWrite: number;
             localSpaceCP: number;
             random: boolean;
             reverse: boolean;
             randomSeed: number;
             localSpaceAngles: boolean;
             _paramChanged(paramName: any, value: any): void;
             doInit(particle: any, elapsedTime: any): void;
         }

         export declare class InitialVelocityNoise extends Operator {
             absVal: vec3;
             absValInv: vec3;
             localSpace: boolean;
             _paramChanged(paramName: any, value: any): void;
             doInit(particle: any, elapsedTime: any): void;
             initMultipleOverride(): boolean;
         }

         export declare function initRandomFloats(): void;

         export declare class InitSkinnedPositionFromCPSnapshot extends Operator {
             #private;
             snapshotControlPointNumber: number;
             random: boolean;
             randomSeed: number;
             rigid: boolean;
             setNormal: boolean;
             ignoreDt: boolean;
             minNormalVelocity: number;
             maxNormalVelocity: number;
             increment: number;
             fullLoopIncrement: number;
             snapShotStartPoint: number;
             boneVelocity: number;
             boneVelocityMax: number;
             copyColor: boolean;
             copyAlpha: boolean;
             copyRadius: boolean;
             _paramChanged(paramName: any, value: any): void;
             doInit(particle: any, elapsedTime: any): void;
         }

         export declare class InitVec extends Operator {
             setMethod: any;
             scaleInitialRange: boolean;
             fieldOutput: number;
             _paramChanged(paramName: any, value: any): void;
             doInit(particle: any, elapsedTime: any): void;
         }

         declare class Input extends InputOutput {
             #private;
             constructor(node: Node_2, id: string, type: InputOutputType, size?: number);
             set value(value: any);
             get value(): any;
             setPredecessor(predecessor: Output): void;
             getPredecessor(): Output;
             hasPredecessor(): boolean;
             getType(): void;
             getValue(): Promise<unknown>;
             isValid(startingPoint: Node_2): boolean;
             toString(tabs?: string): Promise<string>;
         }

         declare class InputOutput {
             node: Node_2;
             id: string;
             type: InputOutputType;
             size: number;
             _value?: any | any[];
             constructor(node: Node_2, id: string, type: InputOutputType, size?: number);
         }

         declare enum InputOutputType {
             Unknown = 0,
             Int = 1,
             Float = 2,
             Vec2 = 3,
             Vec3 = 4,
             Vec4 = 5,
             Quat = 6,
             Color = 7,
             Texture2D = 8,
             IntArray = 1000,
             FloatArray = 1001
         }

         export declare class InstantaneousEmitter extends Operator {
             emitted: number;
             initFromKilledParentParticles: number;
             maxEmittedPerFrame: number;
             snapshotControlPoint: number;
             _paramChanged(paramName: any, value: any): void;
             doEmit(elapsedTime: any): void;
             reset(): void;
         }

         export declare class IntArrayNode extends ParametersNode {
             #private;
             constructor(editor: any, params: any);
             operate(context?: any): Promise<void>;
             get title(): string;
             setValue(index: any, value: any): void;
         }

         export declare class InterpolateRadius extends Operator {
             startTime: number;
             endTime: number;
             startScale: number;
             endScale: number;
             easeInAndOut: boolean;
             bias: number;
             invTime: any;
             biasParam: any;
             scaleWidth: any;
             constructor(system: any);
             _update(): void;
             _paramChanged(paramName: any, value: any): void;
             doOperate(particle: any, elapsedTime: any): void;
         }

         export declare class Intersection {
             position: vec3;
             normal: vec3;
             uv: vec2;
             distance: number;
             entity: Entity;
             distanceFromRay: number;
             constructor(position: vec3, normal: vec3 | null, uv: vec2 | null, distance: number, entity: Entity, distanceFromRay: number);
         }

         export declare class IntProxy extends Proxy_2 {
             init(): void;
             execute(variables: any): void;
         }

         /**
          * Invis proxy.
          * @comment ouput variable name: resultVar
          */
         export declare class Invis extends Proxy_2 {
         }

         export declare function isNumeric(n: any): boolean;

         /**
          * ItemTintColor Proxy
          */
         export declare class ItemTintColor extends Proxy_2 {
             #private;
             init(): void;
             execute(variables: any, proxyParams: any): void;
         }

         export declare class JSONLoader {
             static fromJSON(rootEntity: object): Promise<Entity | Material>;
             static loadEntity(jsonEntity: any, entities: Map<string, Entity | Material>, loadedPromise: Promise<void>): Promise<Entity | Material>;
             static registerEntity(ent: typeof Entity | typeof Material): void;
         }

         declare interface JSONObject {
             [k: string]: JSONValue;
         }

         declare type JSONValue = string | number | boolean | null | JSONValue[] | {
             [key: string]: JSONValue;
         };

         export declare class KeepOnlyLastChild extends Entity {
             addChild(child: Entity): Entity;
             static getEntityName(): string;
         }

         export declare function lerp(min: number, max: number, v: number): number;

         export declare class LessOrEqualProxy extends Proxy_2 {
             execute(variables: any): void;
         }

         export declare class LifespanDecay extends SourceEngineParticleOperator {
             static functionName: string;
             constructor();
             doOperate(particle: any, elapsedTime: any): void;
         }

         export declare class LifetimeFromSequence extends SourceEngineParticleOperator {
             static functionName: string;
             constructor();
             doInit(particle: any, elapsedTime: any): void;
             initMultipleOverride(): boolean;
         }

         export declare class LifetimeRandom extends SourceEngineParticleOperator {
             static functionName: string;
             constructor();
             doInit(particle: any, elapsedTime: any): void;
         }

         export declare class Light extends Entity {
             #private;
             shadow: LightShadow;
             isLight: boolean;
             constructor(parameters?: any);
             set color(color: any);
             get color(): any;
             set intensity(intensity: any);
             get intensity(): any;
             set range(range: any);
             get range(): any;
             set shadowTextureSize(shadowTextureSize: number);
             get shadowTextureSize(): number;
             buildContextMenu(): {
                 visibility: {
                     i18n: string;
                     selected: boolean;
                     f: () => void;
                 };
                 remove: {
                     i18n: string;
                     f: () => void;
                 };
                 destroy: {
                     i18n: string;
                     f: () => void;
                 };
                 remove_more: {
                     i18n: string;
                     submenu: {
                         i18n: string;
                         f: () => void;
                     }[];
                 };
                 name: {
                     i18n: string;
                     f: () => void;
                 };
                 add: {
                     i18n: string;
                     submenu: any;
                 };
                 entitynull_1: any;
                 position: {
                     i18n: string;
                     f: () => void;
                 };
                 translate: {
                     i18n: string;
                     f: () => void;
                 };
                 reset_position: {
                     i18n: string;
                     f: () => vec3;
                 };
                 entitynull_2: any;
                 quaternion: {
                     i18n: string;
                     f: () => void;
                 };
                 rotate: {
                     i18n: string;
                     submenu: {
                         i18n: string;
                         f: () => void;
                     }[];
                 };
                 reset_rotation: {
                     i18n: string;
                     f: () => quat;
                 };
                 entitynull_3: any;
                 scale: {
                     i18n: string;
                     f: () => void;
                 };
                 reset_scale: {
                     i18n: string;
                     f: () => vec3;
                 };
                 entitynull_4: any;
                 wireframe: {
                     i18n: string;
                     selected: boolean;
                     f: () => void;
                 };
                 cast_shadows: {
                     i18n: string;
                     selected: boolean;
                     f: () => void;
                 };
                 receive_shadows: {
                     i18n: string;
                     selected: boolean;
                     f: () => void;
                 };
                 material: {
                     i18n: string;
                     submenu: {};
                 };
             } & {
                 Light_1: any;
                 color: {
                     i18n: string;
                     f: () => void;
                 };
                 intensity: {
                     i18n: string;
                     f: () => void;
                 };
             } & {
                 texture_size: {
                     i18n: string;
                     f: () => void;
                 };
             };
             toJSON(): any;
             static constructFromJSON(json: any): Promise<Light>;
             fromJSON(json: any): void;
             static set defaultTextureSize(textureSize: any);
             static getEntityName(): string;
             is(s: string): boolean;
         }

         export declare class LightMappedGenericMaterial extends SourceEngineMaterial {
             constructor(params?: any);
             clone(): LightMappedGenericMaterial;
             getShaderSource(): string;
         }

         export declare class LightShadow {
             #private;
             light: Light;
             camera: Camera;
             shadowMatrix: mat4;
             viewPorts: Array<vec4>;
             viewPortsLength: number;
             renderTarget: RenderTarget;
             constructor(light: Light, camera: Camera);
             set range(range: number);
             set textureSize(textureSize: number);
             get textureSize(): vec2;
             computeShadowMatrix(mapIndex: any): void;
         }

         export declare class Line extends Mesh {
             #private;
             isLine: boolean;
             constructor(params?: any);
             set start(start: vec3);
             getStart(start?: vec3): vec3;
             set end(end: vec3);
             getEnd(end?: vec3): vec3;
             raycast(raycaster: any, intersections: any): void;
             toJSON(): any;
             static constructFromJSON(json: any, entities: any, loadedPromise: any): Promise<Line>;
             static getEntityName(): string;
         }

         export declare class LinearBezierCurve extends Curve {
             p0: vec3;
             p1: vec3;
             constructor(p0?: vec3, p1?: vec3);
             getPosition(t: any, out?: vec3): vec3;
             getArcLength(): number;
             getAppropriateDivision(): number;
         }

         export declare class LinearRamp extends Proxy_2 {
             #private;
             init(): void;
             execute(variables: any, proxyParams: any, time: any): void;
         }

         export declare class LineMaterial extends Material {
             #private;
             constructor(params?: any);
             getShaderSource(): string;
             set lineWidth(lineWidth: number);
             toJSON(): any;
             static constructFromJSON(json: any): Promise<LineMaterial>;
             fromJSON(json: any): void;
             static getEntityName(): string;
         }

         export declare class LineSegments extends Mesh {
             #private;
             constructor(params?: any);
             setSegments(positions: any, colors?: any): void;
         }

         export declare class LockToBone extends SourceEngineParticleOperator {
             static functionName: string;
             constructor();
             doOperate(particle: any, elapsedTime: any): void;
         }

         declare interface Loopable {
             isLoopable: true;
             setlooping: (looping: boolean) => void;
             getlooping: () => boolean;
         }

         export declare class LoopSubdivision {
             #private;
             constructor();
             subdivide(indices: any, vertices: any, subdivideCount?: number, tolerance?: number): Promise<{
                 indices: Uint32Array<ArrayBuffer>;
                 vertices: Float32Array<ArrayBuffer>;
             }>;
         }

         export declare class MaintainEmitter extends Operator {
             particlesToMaintain: number;
             _paramChanged(paramName: any, value: any): void;
             doEmit(elapsedTime: any): void;
         }

         export declare class MaintainSequentialPath extends Operator {
             numToAssign: number;
             assignedSoFar: number;
             step: number;
             loop: boolean;
             bounceDirection: number;
             maxDistance: number;
             cpPairs: boolean;
             saveOffset: boolean;
             startControlPointNumber: number;
             endControlPointNumber: number;
             bulgeControl: number;
             bulge: number;
             midPoint: number;
             startPointOffset: vec3;
             midPointOffset: vec3;
             endOffset: vec3;
             operateAllParticlesRemoveme: boolean;
             _paramChanged(paramName: any, value: any): void;
             doOperate(particles: any, elapsedTime: any): void;
         }

         export declare class ManifestRepository implements Repository {
             #private;
             constructor(base: Repository);
             get name(): string;
             getFile(filename: string): Promise<RepositoryArrayBufferResponse>;
             getFileAsText(filename: string): Promise<RepositoryTextResponse>;
             getFileAsBlob(filename: string): Promise<RepositoryBlobResponse>;
             getFileAsJson(filename: string): Promise<RepositoryJsonResponse>;
             getFileList(filter?: RepositoryFilter): Promise<RepositoryFileListResponse>;
             generateModelManifest(name?: string, filter?: RepositoryFilter): Promise<RepositoryError | null>;
         }

         export declare class Manipulator extends Entity {
             #private;
             enumerable: boolean;
             camera?: Camera;
             size: number;
             constructor(params?: any);
             resize(camera?: Camera): void;
             startTranslate(x: number, y: number): void;
             startRotate(x: number, y: number): void;
             startScale(x: number, y: number): void;
             setCamera(camera: Camera): void;
             /**
              * @deprecated Please use `setMode` instead.
              */
             set mode(mode: ManipulatorMode);
             setMode(mode: ManipulatorMode): void;
             set axisOrientation(axisOrientation: number);
             getWorldQuaternion(q?: quat): quat;
             getWorldScale(vec?: vec3): vec3;
             set enableX(enableX: boolean);
             get enableX(): boolean;
             set enableY(enableY: boolean);
             get enableY(): boolean;
             set enableZ(enableZ: boolean);
             get enableZ(): boolean;
         }

         declare enum ManipulatorMode {
             Translation = 0,
             Rotation = 1,
             Scale = 2
         }

         /**
          * Map entities
          */
         export declare const MapEntities: {
             (): void;
             entities: any;
             registerEntity(className: any, entityClass: any): void;
             createEntity(map: any, className: any): any;
         };

         /**
          * Map entity
          */
         declare class MapEntity extends Entity {
             static incrementalId: number;
             classname: string;
             outputs: any[];
             m_vecVelocity: vec3;
             m_flMoveDoneTime: number;
             m_flLocalTime: number;
             f: number;
             keys: Map<any, any>;
             targetName: any;
             parentName: any;
             m: any;
             constructor(classname: string);
             setKeyValues(kvElement: any): void;
             setKeyValue(key: any, value: any): void;
             getValue(key: any): any;
             addOutput(outputName: any, outputValue: any): void;
             setInput(input: any, parameter: any): void;
             getFlag(position: any): number;
             set map(map: any);
             get map(): any;
             move(delta: any): void;
             getAbsOrigin(): any;
             getLocalOrigin(): vec3;
             getLocalVelocity(): vec3;
             update(map: any, delta: any): void;
             setParent(parent: any): void;
             setLocalVelocity(vecVelocity: any): void;
             setMoveDoneTime(delay: any): void;
             getLocalTime(): number;
             fireOutput(outputName: any): any[];
             toString(): string;
         }

         export declare class Material {
             #private;
             id: string;
             name: string;
             uniforms: any;
             defines: any;
             parameters: any;
             depthTest: boolean;
             depthFunc: any;
             depthMask: boolean;
             colorMask: vec4;
             blend: boolean;
             srcRGB: any;
             dstRGB: any;
             srcAlpha: any;
             dstAlpha: any;
             modeRGB: any;
             modeAlpha: any;
             polygonOffset: boolean;
             polygonOffsetFactor: number;
             polygonOffsetUnits: number;
             _dirtyProgram: boolean;
             disableCulling: boolean;
             cullMode: any;
             colorMap?: Texture;
             properties: Map<string, any>;
             static materialList: {};
             constructor(params?: any);
             get transparent(): boolean;
             set renderLights(renderLights: boolean);
             get renderLights(): boolean;
             setDefine(define: string, value?: string): void;
             removeDefine(define: any): void;
             setValues(values: any): void;
             clone(): void;
             setTransparency(srcRGB: any, dstRGB: any, srcAlpha?: any, dstAlpha?: any): void;
             setBlending(mode: BlendingMode, premultipliedAlpha?: boolean): void;
             updateMaterial(time: any, mesh: any): void;
             beforeRender(camera: any): void;
             /**
              * @deprecated Please use `renderFace` instead.
              */
             set culling(mode: any);
             renderFace(renderFace: RenderFace): void;
             getRenderFace(): RenderFace;
             setColorMode(colorMode: any): void;
             set colorMode(colorMode: any);
             get colorMode(): any;
             setColor(color: vec4): void;
             set color(color: vec4);
             get color(): vec4;
             setMeshColor(color?: vec4): void;
             setTexture(uniformName: string, texture: Texture, shaderDefine?: string): void;
             setTextureArray(uniformName: any, textureArray: any): void;
             setColorMap(texture: any): void;
             setColor2Map(texture: any): void;
             setDetailMap(texture: any): void;
             setNormalMap(texture: any): void;
             setCubeMap(texture: any): void;
             set alphaTest(alphaTest: any);
             set alphaTestReference(alphaTestReference: any);
             getColorMapSize(size?: vec2): vec2;
             addParameter(name: any, type: any, value: any, changed: any): MateriaParameter;
             removeParameter(name: any): void;
             getParameter(name: any): void;
             setParameterValue(name: any, value: any): void;
             setColor4Uniform(uniformName: any, value: any): void;
             toJSON(): any;
             static constructFromJSON(json: any): Promise<Material>;
             fromJSON(json: any): void;
             addUser(user: any): void;
             removeUser(user: any): void;
             hasNoUser(): boolean;
             dispose(): void;
             static getEntityName(): string;
             get shaderSource(): string;
             getShaderSource(): string;
         }

         export declare const MATERIAL_BLENDING_NONE = 0;

         export declare const MATERIAL_BLENDING_NORMAL = 1;

         export declare const MATERIAL_COLOR_NONE = 0;

         export declare const MATERIAL_COLOR_PER_MESH = 2;

         export declare const MATERIAL_COLOR_PER_VERTEX = 1;

         export declare const MATERIAL_CULLING_BACK = 1029;

         export declare const MATERIAL_CULLING_FRONT = 1028;

         export declare const MATERIAL_CULLING_FRONT_AND_BACK = 1032;

         export declare const MATERIAL_CULLING_NONE = 0;

         export declare class MateriaParameter {
             #private;
             constructor(name: string, type: MateriaParameterType, value: any, changed?: ParameterChanged);
             setValue(value: any): void;
         }

         export declare enum MateriaParameterType {
             None = 0,
             Boolean = 1,
             Integer = 2,
             Float = 3,
             NormalizedFloat = 4,
             ClampedFloat = 5,
             Vec2 = 6,
             Vec3 = 7,
             Vec4 = 8,
             Mat2 = 9,
             Mat3 = 10,
             Mat4 = 11,
             Color2 = 12,
             Color3 = 13,
             Color4 = 14,
             Texture = 15,
             Texture1D = 16,
             Texture2D = 17,
             Texture3D = 18
         }

         export declare const MAX_FLOATS = 4096;

         declare class MdlAttachement {
             name: string;
             lowcasename: string;
             mdl: SourceMDL;
             flags: number;
             localbone: number;
             local: Array<number>;
         }

         declare class MdlBodyPart {
             name: any;
             base: any;
             models: any;
         }

         declare class MdlBone {
             #private;
             _poseToBone: mat4;
             _invPoseToBone: mat4;
             _initPoseToBone: mat4;
             _boneMat: mat4;
             _position: vec3;
             _quaternion: quat;
             _worldPos: vec3;
             _worldQuat: quat;
             _worldMat: mat4;
             _parent: any;
             dirty: boolean;
             lastComputed: number;
             parentBone: number;
             boneId: number;
             name: string;
             lowcasename: string;
             bonecontroller: Array<number>;
             rot: vec3;
             posscale: vec3;
             rotscale: vec3;
             qAlignment: vec4;
             flags: number;
             proctype: number;
             procindex: number;
             physicsbone: number;
             surfacepropidx: number;
             contents: number;
             constructor(skeleton?: Skeleton);
             get skeleton(): any;
             set quaternion(quaternion: quat);
             get quaternion(): quat;
             set position(position: vec3);
             get position(): vec3;
             set parent(parent: any);
             get parent(): any;
             set worldPos(worldPos: vec3);
             set worldQuat(worldQuat: quat);
             getWorldPos(offset: vec3, out?: vec3): vec3;
             getRelativePos(): vec3;
             set poseToBone(poseToBone: mat4);
             get poseToBone(): mat4;
             set initPoseToBone(initPoseToBone: mat4);
             get initPoseToBone(): mat4;
             getWorldQuat(): quat;
             /**
              * Is a procedural bone ?
              * @returns {bool} yes is procedural bone
              */
             isProcedural(): boolean;
             /**
              * Use bone merge
              * @returns {bool} yes bone is available for bone merge to occur against it
              */
             useBoneMerge(): boolean;
         }

         declare class MdlStudioAutoLayer {
             iSequence: any;
             iPose: any;
             flags: any;
             start: any;
             peak: any;
             tail: any;
             end: any;
         }

         declare class MdlStudioEvent {
             cycle: number;
             event: any;
             type: any;
             options: any;
             name: any;
         }

         declare class MdlStudioFlexController {
             localToGlobal: number;
             min: number;
             max: number;
             type: string;
             name: string;
         }

         declare class MdlStudioModelGroup {
             name: any;
             label: any;
         }

         declare class MdlStudioSeqDesc {
             paramindex: any[];
             paramstart: any[];
             paramend: any[];
             blend: any[];
             weightlist: any[];
             groupsize: any[];
             mdl: any;
             previousTime: number;
             currentTime: number;
             posekeyindex: number;
             autolayer: Array<MdlStudioAutoLayer>;
             events: Array<MdlStudioEvent>;
             name: string;
             flags: number;
             activity: any;
             id: any;
             startOffset: any;
             actweight: any;
             numevents: any;
             eventindex: any;
             bbmin: any;
             bbmax: any;
             numblends: any;
             animindexindex: any;
             movementindex: any;
             paramparent: any;
             fadeintime: any;
             fadeouttime: any;
             localentrynode: any;
             localexitnode: any;
             nodeflags: any;
             entryphase: any;
             exitphase: any;
             lastframe: any;
             nextseq: any;
             pose: any;
             numikrules: any;
             numautolayers: any;
             autolayerindex: any;
             weightlistindex: any;
             numiklocks: any;
             iklockindex: any;
             keyvalueindex: any;
             keyvaluesize: any;
             cycleposeindex: any;
             activityName: any;
             keyvalueText: any;
             pBoneweight(boneIndex: any): any;
             getBlend(x: any, y: any): any;
             poseKey(iParam: any, iAnim: any): any;
             getAutoLayer(autoLayerIndex: any): MdlStudioAutoLayer;
             get length(): number;
             play(dynamicProp: any): any;
             processEvent(event: any, dynamicProp: any): void;
         }

         declare class MdlTexture {
             name: any;
             originalName: any;
         }

         export declare class MergeRepository implements Repository {
             #private;
             constructor(name: string, ...repositories: Array<Repository>);
             get name(): string;
             getFile(filename: string): Promise<RepositoryArrayBufferResponse>;
             getFileAsText(filename: string): Promise<RepositoryTextResponse>;
             getFileAsBlob(filename: string): Promise<RepositoryBlobResponse>;
             getFileAsJson(filename: string): Promise<RepositoryJsonResponse>;
             getFileList(filter?: RepositoryFilter): Promise<RepositoryFileListResponse>;
             pushRepository(repo: Repository): Promise<void>;
             unshiftRepository(repo: Repository): Promise<void>;
         }

         export declare class Mesh extends Entity {
             #private;
             renderMode: number;
             isRenderable: boolean;
             uniforms: {};
             defines: any;
             isMesh: boolean;
             constructor(geometry?: BufferGeometry, material?: Material);
             set material(material: Material);
             get material(): Material;
             setGeometry(geometry?: BufferGeometry): void;
             get geometry(): BufferGeometry;
             setMaterial(material?: Material): void;
             getMaterial(): Material;
             getUniform(name: string): any;
             setUniform(name: string, uniform: any): void;
             deleteUniform(name: string): void;
             setDefine(define: string, value?: string | number): void;
             removeDefine(define: string): void;
             exportObj(): {
                 f?: Uint8Array | Uint32Array;
                 v?: Float32Array;
                 vn?: Float32Array;
                 vt?: Float32Array;
             };
             dispose(): void;
             toString(): string;
             getBoundsModelSpace(min?: vec3, max?: vec3): void;
             getBoundingBox(boundingBox?: BoundingBox): BoundingBox;
             propagate(): void;
             buildContextMenu(): {
                 visibility: {
                     i18n: string;
                     selected: boolean;
                     f: () => void;
                 };
                 remove: {
                     i18n: string;
                     f: () => void;
                 };
                 destroy: {
                     i18n: string;
                     f: () => void;
                 };
                 remove_more: {
                     i18n: string;
                     submenu: {
                         i18n: string;
                         f: () => void;
                     }[];
                 };
                 name: {
                     i18n: string;
                     f: () => void;
                 };
                 add: {
                     i18n: string;
                     submenu: any;
                 };
                 entitynull_1: any;
                 position: {
                     i18n: string;
                     f: () => void;
                 };
                 translate: {
                     i18n: string;
                     f: () => void;
                 };
                 reset_position: {
                     i18n: string;
                     f: () => vec3;
                 };
                 entitynull_2: any;
                 quaternion: {
                     i18n: string;
                     f: () => void;
                 };
                 rotate: {
                     i18n: string;
                     submenu: {
                         i18n: string;
                         f: () => void;
                     }[];
                 };
                 reset_rotation: {
                     i18n: string;
                     f: () => quat;
                 };
                 entitynull_3: any;
                 scale: {
                     i18n: string;
                     f: () => void;
                 };
                 reset_scale: {
                     i18n: string;
                     f: () => vec3;
                 };
                 entitynull_4: any;
                 wireframe: {
                     i18n: string;
                     selected: boolean;
                     f: () => void;
                 };
                 cast_shadows: {
                     i18n: string;
                     selected: boolean;
                     f: () => void;
                 };
                 receive_shadows: {
                     i18n: string;
                     selected: boolean;
                     f: () => void;
                 };
                 material: {
                     i18n: string;
                     submenu: {};
                 };
             };
             raycast(raycaster: any, intersections: any): void;
             static getEntityName(): string;
             is(s: string): boolean;
         }

         export declare class MeshBasicMaterial extends Material {
             map: any;
             lightMap: any;
             lightMapIntensity: number;
             aoMap: any;
             aoMapIntensity: number;
             specularMap: any;
             alphaMap: any;
             envMap: any;
             combine: number;
             reflectivity: number;
             refractionRatio: number;
             wireframe: boolean;
             wireframeLinewidth: number;
             wireframeLinecap: string;
             wireframeLinejoin: string;
             skinning: boolean;
             morphTargets: boolean;
             constructor(params?: any);
             getShaderSource(): string;
             toJSON(): any;
             static constructFromJSON(json: any): Promise<MeshBasicMaterial>;
             fromJSON(json: any): void;
             static getEntityName(): string;
         }

         export declare class MeshBasicPbrMaterial extends Material {
             constructor(params?: any);
             setParameters(params?: any): void;
             setColor(color: any): void;
             setMetalness(metalness: any): void;
             setRoughness(roughness: any): void;
             setColorTexture(colorTexture: any): void;
             setNormalTexture(normalTexture: any): void;
             setMetalnessTexture(metalnessTexture: any): void;
             setRoughnessTexture(roughnessTexture: any): void;
             get shaderSource(): string;
             toJSON(): any;
             static constructFromJSON(json: any): Promise<MeshBasicPbrMaterial>;
             fromJSON(json: any): void;
             static getEntityName(): string;
         }

         export declare class MeshFlatMaterial extends Material {
             constructor(params?: any);
             getShaderSource(): string;
         }

         export declare class MeshPhongMaterial extends Material {
             map: any;
             lightMap: any;
             lightMapIntensity: number;
             aoMap: any;
             aoMapIntensity: number;
             specularMap: any;
             alphaMap: any;
             envMap: any;
             combine: number;
             reflectivity: number;
             refractionRatio: number;
             wireframe: boolean;
             wireframeLinewidth: number;
             wireframeLinecap: string;
             wireframeLinejoin: string;
             skinning: boolean;
             morphTargets: boolean;
             constructor(params?: any);
             getShaderSource(): string;
         }

         export declare class Metaball extends Entity {
             currentWorldPosition: vec3;
             radius: number;
             radius2: number;
             constructor(radius?: number);
             setRadius(radius: number): void;
             buildContextMenu(): {
                 visibility: {
                     i18n: string;
                     selected: boolean;
                     f: () => void;
                 };
                 remove: {
                     i18n: string;
                     f: () => void;
                 };
                 destroy: {
                     i18n: string;
                     f: () => void;
                 };
                 remove_more: {
                     i18n: string;
                     submenu: {
                         i18n: string;
                         f: () => void;
                     }[];
                 };
                 name: {
                     i18n: string;
                     f: () => void;
                 };
                 add: {
                     i18n: string;
                     submenu: any;
                 };
                 entitynull_1: any;
                 position: {
                     i18n: string;
                     f: () => void;
                 };
                 translate: {
                     i18n: string;
                     f: () => void;
                 };
                 reset_position: {
                     i18n: string;
                     f: () => vec3;
                 };
                 entitynull_2: any;
                 quaternion: {
                     i18n: string;
                     f: () => void;
                 };
                 rotate: {
                     i18n: string;
                     submenu: {
                         i18n: string;
                         f: () => void;
                     }[];
                 };
                 reset_rotation: {
                     i18n: string;
                     f: () => quat;
                 };
                 entitynull_3: any;
                 scale: {
                     i18n: string;
                     f: () => void;
                 };
                 reset_scale: {
                     i18n: string;
                     f: () => vec3;
                 };
                 entitynull_4: any;
                 wireframe: {
                     i18n: string;
                     selected: boolean;
                     f: () => void;
                 };
                 cast_shadows: {
                     i18n: string;
                     selected: boolean;
                     f: () => void;
                 };
                 receive_shadows: {
                     i18n: string;
                     selected: boolean;
                     f: () => void;
                 };
                 material: {
                     i18n: string;
                     submenu: {};
                 };
             } & {
                 Metaball_1: any;
                 radius: {
                     i18n: string;
                     f: () => void;
                 };
             };
         }

         export declare class Metaballs extends Mesh {
             #private;
             cubeWidth: number;
             constructor(material?: MeshBasicMaterial, cubeWidth?: number);
             addBall(ball?: Metaball): Metaball;
             setBalls(balls: Array<Metaball>): void;
             updateGeometry(): void;
             buildContextMenu(): {
                 visibility: {
                     i18n: string;
                     selected: boolean;
                     f: () => void;
                 };
                 remove: {
                     i18n: string;
                     f: () => void;
                 };
                 destroy: {
                     i18n: string;
                     f: () => void;
                 };
                 remove_more: {
                     i18n: string;
                     submenu: {
                         i18n: string;
                         f: () => void;
                     }[];
                 };
                 name: {
                     i18n: string;
                     f: () => void;
                 };
                 add: {
                     i18n: string;
                     submenu: any;
                 };
                 entitynull_1: any;
                 position: {
                     i18n: string;
                     f: () => void;
                 };
                 translate: {
                     i18n: string;
                     f: () => void;
                 };
                 reset_position: {
                     i18n: string;
                     f: () => vec3;
                 };
                 entitynull_2: any;
                 quaternion: {
                     i18n: string;
                     f: () => void;
                 };
                 rotate: {
                     i18n: string;
                     submenu: {
                         i18n: string;
                         f: () => void;
                     }[];
                 };
                 reset_rotation: {
                     i18n: string;
                     f: () => quat;
                 };
                 entitynull_3: any;
                 scale: {
                     i18n: string;
                     f: () => void;
                 };
                 reset_scale: {
                     i18n: string;
                     f: () => vec3;
                 };
                 entitynull_4: any;
                 wireframe: {
                     i18n: string;
                     selected: boolean;
                     f: () => void;
                 };
                 cast_shadows: {
                     i18n: string;
                     selected: boolean;
                     f: () => void;
                 };
                 receive_shadows: {
                     i18n: string;
                     selected: boolean;
                     f: () => void;
                 };
                 material: {
                     i18n: string;
                     submenu: {};
                 };
             } & {
                 Metaballs_1: any;
                 add_ball: {
                     i18n: string;
                     f: () => void;
                 };
                 cube_width: {
                     i18n: string;
                     f: () => void;
                 };
             };
         }

         /**
          * ModelGlowColor proxy.
          * @comment ouput variable name: resultVar
          */
         export declare class ModelGlowColor extends Proxy_2 {
             #private;
             init(): void;
             execute(variables: any, proxyParams: any): void;
         }

         export declare class ModelLoader {
             #private;
             load(repositoryName: any, fileName: any): Promise<unknown>;
         }

         export declare const MOUSE: {
             LEFT: number;
             MIDDLE: number;
             RIGHT: number;
             ROTATE: number;
             DOLLY: number;
             PAN: number;
             NONE: number;
         };

         export declare class MovementBasic extends SourceEngineParticleOperator {
             static functionName: string;
             constructor();
             doOperate(particle: any, elapsedTime: any): void;
         }

         export declare class MovementLocktoControlPoint extends SourceEngineParticleOperator {
             static functionName: string;
             static once: any;
             constructor();
             doOperate(particle: any, elapsedTime: any): void;
         }

         export declare class MovementMaxVelocity extends SourceEngineParticleOperator {
             static functionName: string;
             constructor();
             doOperate(particle: any, elapsedTime: any): void;
         }

         export declare class MovementRigidAttachToCP extends Operator {
             scaleControlPoint: number;
             scaleCPField: number;
             fieldInput: number;
             fieldOutput: number;
             offsetLocal: boolean;
             constructor(system: any);
             _paramChanged(paramName: any, value: any): void;
             doOperate(particle: any, elapsedTime: any): void;
         }

         export declare class MovementRotateParticleAroundAxis extends SourceEngineParticleOperator {
             static functionName: string;
             once: boolean;
             constructor();
             doOperate(particle: any, elapsedTime: any): void;
         }

         export declare class Multiply extends Node_2 {
             #private;
             constructor(editor: NodeImageEditor, params?: any);
             operate(context?: any): Promise<void>;
             get title(): string;
             dispose(): void;
         }

         declare class Node_2 extends EventTarget {
             #private;
             id: string;
             editor: NodeImageEditor;
             inputs: Map<string, Input>;
             outputs: Map<any, any>;
             params: Map<string, NodeParam>;
             previewPic: HTMLImageElement;
             previewSize: number;
             autoRedraw: boolean;
             protected material: Material;
             constructor(editor: NodeImageEditor, params?: any);
             addInput(inputId: any, inputType: any, size?: number): Input;
             addOutput(outputId: any, outputType: any): Output;
             getInput(inputId: any): Input;
             getOutput(outputId: any): any;
             operate(context?: any): Promise<void>;
             addParam(param: NodeParam): void;
             getParam(paramName: string): NodeParam;
             getValue(paramName: string): any;
             setParams(params?: any): void;
             setParam(paramName: any, paramValue: any, paramIndex?: any): void;
             setPredecessor(inputId: any, predecessor: any, predecessorOutputId: any): void;
             getParams(): Map<string, NodeParam>;
             invalidate(): void;
             validate(): Promise<void>;
             redraw(context?: any): Promise<void>;
             getInputCount(): number;
             getType(): void;
             ready(): Promise<unknown>;
             isValid(startingPoint?: Node_2): any;
             hasSuccessor(): boolean;
             successorsLength(): number;
             get title(): string;
             updatePreview(context?: any): void;
             savePicture(): Promise<void>;
             saveVTF(): Promise<void>;
             toString(tabs?: string): Promise<string>;
             dispose(): void;
             set hasPreview(hasPreview: boolean);
             get hasPreview(): boolean;
         }
         export { Node_2 as Node }

         export declare class NodeImageEditor extends EventTarget {
             #private;
             textureSize: number;
             constructor();
             render(material: Material): void;
             addNode(operationName: string, params?: any): Node_2;
             removeNode(node: any): void;
             removeAllNodes(): void;
             getVariable(name: any): any;
             setVariable(name: any, value: any): Map<any, any>;
             deleteVariable(name: any): boolean;
             clearVariables(): void;
             getNodes(): Set<Node_2>;
         }

         export declare class NodeImageEditorGui {
             #private;
             constructor(nodeImageEditor?: NodeImageEditor);
             /**
              * @deprecated Please use `setNodeImageEditor` instead.
              */
             set nodeImageEditor(nodeImageEditor: NodeImageEditor);
             setNodeImageEditor(nodeImageEditor?: NodeImageEditor): void;
             get htmlElement(): Element;
             refresh(): void;
             setNodeFilter(nodeName: string): void;
             getNodeFilter(): string;
         }

         export declare class NodeImageEditorMaterial extends Material {
             shaderName: string;
             constructor(params: any);
             getShaderSource(): string;
         }

         declare class NodeParam {
             name: string;
             type: NodeParamType;
             value: any;
             length?: number;
             constructor(name: string, type: NodeParamType, value: any, length?: number);
         }

         declare enum NodeParamType {
             Unknown = 0,
             Int = 1,
             Bool = 2,
             Float = 3,
             Radian = 4,
             Degree = 5,
             String = 6,
             Vec2 = 7,
             StickerAdjust = 8
         }

         export declare class Noise extends Operator {
             fieldOutput: number;
             outputMin: number;
             outputMax: number;
             noiseScale: number;
             additive: boolean;
             noiseAnimationTimeScale: number;
             outputMin1: any;
             outputMax1: any;
             valueScale: any;
             valueBase: any;
             constructor(system: any);
             _update(): void;
             _paramChanged(paramName: any, value: any): void;
             doOperate(particle: any, elapsedTime: any): void;
         }

         export declare class NoiseEmitter extends Operator {
             emissionDuration: number;
             startTime: number;
             scaleControlPoint: number;
             scaleControlPointField: number;
             worldNoisePoint: number;
             absVal: boolean;
             absValInv: boolean;
             offset: number;
             outputMin: number;
             outputMax: number;
             noiseScale: number;
             worldNoiseScale: number;
             offsetLoc: vec3;
             worldTimeScale: number;
             remainder: number;
             _paramChanged(paramName: any, value: any): void;
             doEmit(elapsedTime: any): void;
         }

         export declare class NormalAlignToCP extends Operator {
             _paramChanged(paramName: any, value: any): void;
             doInit(particle: any, elapsedTime: any): void;
         }

         export declare class NormalizeVector extends Operator {
             fieldOutput: number;
             scale: number;
             _paramChanged(paramName: any, value: any): void;
             doOperate(particle: any, elapsedTime: any): void;
         }

         export declare class NormalLock extends Operator {
             _paramChanged(paramName: any, value: any): void;
             doOperate(particle: any, elapsedTime: any): void;
         }

         export declare class NormalOffset extends Operator {
             offsetMin: vec3;
             offsetMax: vec3;
             localCoords: boolean;
             normalize: boolean;
             _paramChanged(paramName: any, value: any): void;
             doInit(particle: any, elapsedTime: any): void;
             initMultipleOverride(): boolean;
         }

         export declare class ObjExporter {
             #private;
             scene: Scene;
             camera: Camera;
             constructor();
             exportMeshes({ meshes, exportTexture, singleMesh, digits, subdivisions, mergeTolerance }?: {
                 meshes?: Set<Entity>;
                 exportTexture?: boolean;
                 singleMesh?: boolean;
                 digits?: number;
                 subdivisions?: number;
                 mergeTolerance?: number;
             }): Promise<Set<File>>;
         }

         export declare class OBJImporter {
             static load(txt: any): Mesh;
         }

         export declare class OffsetVectorToVector extends Operator {
             outputMin: vec3;
             outputMax: vec3;
             fieldOutput: number;
             fieldInput: number;
             _paramChanged(paramName: any, value: any): void;
             doInit(particle: any, elapsedTime: any): void;
         }

         export declare class OldMoviePass extends Pass {
             constructor(camera: any);
             render(renderer: any, readBuffer: any, writeBuffer: any, renderToScreen: any): void;
         }

         export declare const ONE_EPS = 1.0000001;

         declare class Operator {
             #private;
             static PVEC_TYPE_PARTICLE_VECTOR: boolean;
             system: Source2ParticleSystem;
             opStartFadeInTime: number;
             opEndFadeInTime: number;
             opStartFadeOutTime: number;
             opEndFadeOutTime: number;
             opFadeOscillatePeriod: number;
             normalizePerLiving: boolean;
             disableOperator: boolean;
             controlPointNumber: number;
             fieldInput: number;
             fieldOutput: number;
             scaleCp: number;
             mesh: Mesh;
             material: Source2SpriteCard;
             endCapState: any;
             currentTime: number;
             constructor(system: Source2ParticleSystem);
             setParam(paramName: any, value: any): void;
             getParam(paramName: any): any;
             getParamScalarValue(paramName: any, particle?: any): any;
             _getParamScalarValue2(parameter: any, inputValue: any): any;
             _getParamScalarValueCurve(parameter: any, inputValue: any): any;
             _getCurveValue(curve: any, x: any): any;
             getParamVectorValue(paramName: any, particle?: any, outVec?: vec3 | vec4): any;
             _getParamVectorValueFloatInterpGradient(parameter: any, particle: any, outVec: any): any;
             _paramChanged(paramName: any, value: any): void;
             initializeParticle(particles: any, elapsedTime: any): void;
             operateParticle(particle: any, elapsedTime: any): void;
             forceParticle(particle: any, elapsedTime: any, accumulatedForces: any): void;
             constraintParticle(particle: any): void;
             emitParticle(creationTime: any, elapsedTime: any): any;
             renderParticle(particleList: any, elapsedTime: any, material: any): void;
             checkIfOperatorShouldRun(): boolean;
             fadeInOut(): number;
             setMaterial(material: Source2SpriteCard): void;
             setParameter(parameter: any, type: any, value: any): this;
             getParameter(parameter: any): any;
             getParameters(): {};
             setParameters(parameters: any): this;
             doNothing(): void;
             reset(): void;
             getOperatorFade(): number;
             getInputValue(inputField: any, particle: any): any;
             getInputValueAsVector(inputField: any, particle: any, v: any): void;
             setOutputValue(outputField: any, value: any, particle: any): void;
             initMultipleOverride(): boolean;
             isPreEmission(): boolean;
             setOrientationType(orientationType: any): void;
             setOutputBlendMode(outputBlendMode: any): void;
             init(): void;
             dispose(): void;
             doInit(particle: any, elapsedTime: number, strength: number): void;
             doOperate(particle: any, elapsedTime: number, strength: number): void;
             doForce(particle: any, elapsedTime: number, strength: number): void;
             applyConstraint(particle: any): void;
             doRender(particle: any, elapsedTime: number, material: Source2Material): void;
         }

         export declare class OrbitControl extends CameraControl {
             #private;
             constructor(camera?: Camera);
             set target(target: Target);
             get target(): Target;
             setTargetPosition(position: any): void;
             set upVector(upVector: vec3);
             get upVector(): vec3;
             set minPolarAngle(minPolarAngle: number);
             get minPolarAngle(): number;
             set maxPolarAngle(maxPolarAngle: number);
             get maxPolarAngle(): number;
             set dampingFactor(dampingFactor: number);
             get dampingFactor(): number;
             setupCamera(): void;
             update(delta?: number): boolean;
             set autoRotateSpeed(speed: any);
             get zoomScale(): number;
             handleEnabled(): void;
         }

         export declare class OscillateScalar extends SourceEngineParticleOperator {
             static functionName: string;
             constructor();
             doOperate(particle: any, elapsedTime: any): void;
         }

         export declare class OscillateScalarSimple extends Operator {
             rate: number;
             frequency: number;
             field: number;
             oscMult: number;
             oscAdd: number;
             _paramChanged(paramName: any, value: any): void;
             doOperate(particle: any, elapsedTime: any): void;
         }

         export declare class OscillateVector extends SourceEngineParticleOperator {
             static functionName: string;
             constructor();
             doOperate(particle: any, elapsedTime: any): void;
         }

         export declare class OutlinePass extends Pass {
             #private;
             scene: Scene;
             width: number;
             height: number;
             constructor(scene: Scene, camera: Camera);
             setSize(width: any, height: any): void;
             changeVisibilityOfSelectedObjects(visible: any): void;
             changeVisibilityOfNonSelectedObjects(visible: any): void;
             render(renderer: any, readBuffer: any, writeBuffer: any, renderToScreen: any): void;
         }

         declare class Output extends InputOutput {
             #private;
             get value(): Promise<unknown>;
             getValue(): Promise<unknown>;
             get pixelArray(): Promise<Uint8Array<ArrayBufferLike>>;
             getPixelArray(): Promise<Uint8Array | null>;
             addSuccessor(successor: InputOutput): void;
             removeSuccessor(successor: InputOutput): void;
             hasSuccessor(): boolean;
             successorsLength(): number;
             invalidate(): void;
             getType(): void;
             isValid(startingPoint: Node_2): any;
             toString(tabs?: string): Promise<string>;
             dispose(): void;
         }

         export declare class OverrideRepository implements Repository {
             #private;
             constructor(base: Repository);
             get name(): string;
             getFile(filename: string): Promise<RepositoryArrayBufferResponse>;
             getFileAsText(filename: string): Promise<RepositoryTextResponse>;
             getFileAsBlob(filename: string): Promise<RepositoryBlobResponse>;
             getFileAsJson(filename: string): Promise<RepositoryJsonResponse>;
             getFileList(filter?: RepositoryFilter): Promise<RepositoryFileListResponse>;
             overrideFile(filename: string, file: File): Promise<RepositoryError | null>;
         }

         export declare class PalettePass extends Pass {
             constructor(camera: any);
             render(renderer: any, readBuffer: any, writeBuffer: any, renderToScreen: any): void;
         }

         declare type ParameterChanged = (newValue: any, oldValue?: any) => void;

         export declare class ParametersNode extends Node_2 {
             isParametersNode: boolean;
         }

         declare class ParamType {
             param: string;
             type: string;
             constructor(param: string, type: string);
         }

         export declare const PARENT_CHANGED = "parentchanged";

         export declare type ParentChangedEventData = {
             child: Entity;
             oldParent: Entity | null;
             newParent: Entity | null;
         };

         export declare function ParticleRandomFloat(id: any, offset: any): any;

         export declare function ParticleRandomVec3(vec: any, id: any, offset1: any, offset2: any, offset3: any): any;

         export declare class Pass {
             camera: Camera;
             quad?: FullScreenQuad;
             enabled: boolean;
             swapBuffers: boolean;
             renderToScreen: boolean;
             setSize(width: any, height: any): void;
             render(renderer: any, readBuffer: any, writeBuffer: any, renderToScreen: any, delta: any): void;
         }

         export declare class Path extends Curve {
             looping: boolean;
             _curves: Array<Curve>;
             cursor: vec3;
             constructor(looping?: boolean);
             set curves(curves: Curve[]);
             get curves(): Curve[];
             addCurve(curve: any): void;
             getArcLength(divisions?: any): number;
             getPosition(t: any, out?: vec3): vec3;
             moveTo(p0: any): void;
             lineTo(p1: any): void;
             quadraticCurveTo(p1: any, p2: any): void;
             cubicCurveTo(p1: any, p2: any, p3: any): void;
             getPoints(divisions?: number): any[];
             fromSvgPath(path: any): void;
         }

         export declare class PercentageBetweenCPs extends Operator {
             fieldOutput: number;
             inputMin: number;
             inputMax: number;
             outputMin: number;
             outputMax: number;
             startCP: number;
             endCP: number;
             setMethod: any;
             activeRange: boolean;
             radialCheck: boolean;
             scaleInitialRange: boolean;
             _paramChanged(paramName: any, value: any): void;
             doOperate(particle: any, elapsedTime: any): void;
         }

         export declare const PI: number;

         export declare class PinParticleToCP extends Operator {
             offsetLocal: boolean;
             particleSelection: any;
             pinBreakType: any;
             breakControlPointNumber: number;
             breakControlPointNumber2: number;
             _paramChanged(paramName: any, value: any): void;
             doOperate(particle: any, elapsedTime: any): void;
         }

         export declare class PixelatePass extends Pass {
             #private;
             constructor(camera: any);
             set horizontalTiles(horizontalTiles: any);
             set pixelStyle(pixelStyle: any);
             render(renderer: any, readBuffer: any, writeBuffer: any, renderToScreen: any): void;
         }

         export declare class Plane extends Mesh {
             #private;
             constructor(params?: any);
             setWidth(width: number): void;
             setHeight(height: number): void;
             setSize(width: number, height?: number): void;
             buildContextMenu(): {
                 visibility: {
                     i18n: string;
                     selected: boolean;
                     f: () => void;
                 };
                 remove: {
                     i18n: string;
                     f: () => void;
                 };
                 destroy: {
                     i18n: string;
                     f: () => void;
                 };
                 remove_more: {
                     i18n: string;
                     submenu: {
                         i18n: string;
                         f: () => void;
                     }[];
                 };
                 name: {
                     i18n: string;
                     f: () => void;
                 };
                 add: {
                     i18n: string;
                     submenu: any;
                 };
                 entitynull_1: any;
                 position: {
                     i18n: string;
                     f: () => void;
                 };
                 translate: {
                     i18n: string;
                     f: () => void;
                 };
                 reset_position: {
                     i18n: string;
                     f: () => vec3;
                 };
                 entitynull_2: any;
                 quaternion: {
                     i18n: string;
                     f: () => void;
                 };
                 rotate: {
                     i18n: string;
                     submenu: {
                         i18n: string;
                         f: () => void;
                     }[];
                 };
                 reset_rotation: {
                     i18n: string;
                     f: () => quat;
                 };
                 entitynull_3: any;
                 scale: {
                     i18n: string;
                     f: () => void;
                 };
                 reset_scale: {
                     i18n: string;
                     f: () => vec3;
                 };
                 entitynull_4: any;
                 wireframe: {
                     i18n: string;
                     selected: boolean;
                     f: () => void;
                 };
                 cast_shadows: {
                     i18n: string;
                     selected: boolean;
                     f: () => void;
                 };
                 receive_shadows: {
                     i18n: string;
                     selected: boolean;
                     f: () => void;
                 };
                 material: {
                     i18n: string;
                     submenu: {};
                 };
             } & {
                 Plane_1: any;
                 width: {
                     i18n: string;
                     f: () => void;
                 };
                 height: {
                     i18n: string;
                     f: () => void;
                 };
                 square: {
                     i18n: string;
                     f: () => void;
                 };
             };
             toJSON(): any;
             static constructFromJSON(json: any, entities: any, loadedPromise: any): Promise<Plane>;
             static getEntityName(): string;
         }

         export declare class PlaneCull extends Operator {
             planeControlPoint: number;
             planeDirection: vec3;
             localSpace: boolean;
             planeOffset: number;
             planeDirectionOffset: vec3;
             constructor(system: any);
             _update(): void;
             _paramChanged(paramName: any, value: any): void;
             doOperate(particle: any, elapsedTime: any): void;
         }

         export declare class PointLight extends Light {
             isPointLight: boolean;
             constructor(params?: any);
             set castShadow(castShadow: boolean | undefined);
             get castShadow(): boolean | undefined;
             toJSON(): any;
             static constructFromJSON(json: any): Promise<PointLight>;
             fromJSON(json: any): void;
             buildContextMenu(): {
                 visibility: {
                     i18n: string;
                     selected: boolean;
                     f: () => void;
                 };
                 remove: {
                     i18n: string;
                     f: () => void;
                 };
                 destroy: {
                     i18n: string;
                     f: () => void;
                 };
                 remove_more: {
                     i18n: string;
                     submenu: {
                         i18n: string;
                         f: () => void;
                     }[];
                 };
                 name: {
                     i18n: string;
                     f: () => void;
                 };
                 add: {
                     i18n: string;
                     submenu: any;
                 };
                 entitynull_1: any;
                 position: {
                     i18n: string;
                     f: () => void;
                 };
                 translate: {
                     i18n: string;
                     f: () => void;
                 };
                 reset_position: {
                     i18n: string;
                     f: () => vec3;
                 };
                 entitynull_2: any;
                 quaternion: {
                     i18n: string;
                     f: () => void;
                 };
                 rotate: {
                     i18n: string;
                     submenu: {
                         i18n: string;
                         f: () => void;
                     }[];
                 };
                 reset_rotation: {
                     i18n: string;
                     f: () => quat;
                 };
                 entitynull_3: any;
                 scale: {
                     i18n: string;
                     f: () => void;
                 };
                 reset_scale: {
                     i18n: string;
                     f: () => vec3;
                 };
                 entitynull_4: any;
                 wireframe: {
                     i18n: string;
                     selected: boolean;
                     f: () => void;
                 };
                 cast_shadows: {
                     i18n: string;
                     selected: boolean;
                     f: () => void;
                 };
                 receive_shadows: {
                     i18n: string;
                     selected: boolean;
                     f: () => void;
                 };
                 material: {
                     i18n: string;
                     submenu: {};
                 };
             } & {
                 Light_1: any;
                 color: {
                     i18n: string;
                     f: () => void;
                 };
                 intensity: {
                     i18n: string;
                     f: () => void;
                 };
             } & {
                 texture_size: {
                     i18n: string;
                     f: () => void;
                 };
             } & {
                 range: {
                     i18n: string;
                     f: () => void;
                 };
             };
             static getEntityName(): string;
             is(s: string): boolean;
         }

         export declare class PointLightHelper extends Mesh {
             #private;
             constructor();
         }

         export declare function Polygonise(/*GRIDCELL */ grid: any, /*double */ isolevel: any, /*TRIANGLE **/ triangles: any): any;

         export declare class PositionAlongPathRandom extends SourceEngineParticleOperator {
             static functionName: string;
             sequence: number;
             constructor();
             doInit(particle: any, elapsedTime: any): void;
             reset(): void;
         }

         export declare class PositionAlongPathSequential extends SourceEngineParticleOperator {
             static functionName: string;
             sequence: number;
             constructor();
             doInit(particle: any, elapsedTime: any): void;
             reset(): void;
         }

         export declare class PositionFromParentParticles extends SourceEngineParticleOperator {
             static functionName: string;
             constructor();
             doInit(particle: any, elapsedTime: any): void;
         }

         export declare class PositionLock extends Operator {
             startTimeMin: number;
             startTimeMax: number;
             startTimeExp: number;
             endTimeMin: number;
             endTimeMax: number;
             endTimeExp: number;
             range: number;
             jumpThreshold: number;
             prevPosScale: number;
             lockRot: boolean;
             startFadeOutTime: any;
             endFadeOutTime: any;
             constructor(system: any);
             _update(): void;
             _paramChanged(paramName: any, value: any): void;
             doOperate(particle: any, elapsedTime: any): void;
         }

         export declare class PositionModifyOffsetRandom extends SourceEngineParticleOperator {
             static functionName: string;
             constructor();
             doInit(particle: any, elapsedTime: any): void;
             initMultipleOverride(): boolean;
         }

         export declare class PositionOffset extends Operator {
             localCoords: boolean;
             proportional: boolean;
             _paramChanged(paramName: any, value: any): void;
             doInit(particle: any, elapsedTime: any): void;
             initMultipleOverride(): boolean;
         }

         export declare class PositionOnModelRandom extends SourceEngineParticleOperator {
             static functionName: string;
             constructor();
             doInit(particle: any, elapsedTime: any): void;
         }

         export declare class PositionWarp extends Operator {
             warpMin: vec3;
             warpMax: vec3;
             scaleControlPointNumber: number;
             radiusComponent: number;
             warpTime: number;
             warpStartTime: number;
             prevPosScale: number;
             invertWarp: boolean;
             useCount: boolean;
             _paramChanged(paramName: any, value: any): void;
             doInit(particle: any, elapsedTime: any): void;
         }

         export declare class PositionWithinBoxRandom extends SourceEngineParticleOperator {
             static functionName: string;
             constructor();
             doInit(particle: any, elapsedTime: any): void;
         }

         export declare class PositionWithinSphereRandom extends SourceEngineParticleOperator {
             static functionName: string;
             constructor();
             doInit(particle: any, elapsedTime: any): void;
         }

         export declare function pow2(n: number): number;

         export declare class Program {
             #private;
             attributes: Map<string, number>;
             uniforms: Map<string, Uniform>;
             constructor(glContext: WebGLAnyRenderingContext, vertexShaderName: string, fragmentShaderName: string);
             get program(): void;
             get vs(): void;
             get fs(): void;
             setUniformValue(name: string, value: any): void;
             validate(includeCode: string): boolean;
             invalidate(): void;
             isValid(): boolean;
             getProgram(): WebGLProgram;
         }

         export declare const PROPERTY_CHANGED = "propertychanged";

         export declare type PropertyChangedEventData = {
             entity: Entity;
             name: string;
             value: any;
             oldValue: any;
         };

         /**
          * Source engine material interface
          */
         declare class Proxy_2 {
             datas: any;
             /**
              * TODO
              */
             setParams(datas: any, variables: any): void;
             /**
              * TODO
              */
             getData(name: any): any;
             /**
              * Dummy function
              */
             init(variables: any): void;
             /**
              * Dummy function
              */
             execute(variables: any, proxyParams: any, time: any): void;
             setResult(variables: any, value: any): void;
             getVariable(variables: any, name: any): any;
         }

         /**
          * Proxy manager
          */
         export declare class ProxyManager {
             #private;
             static getProxy(proxyName: any): any;
             static registerProxy(proxyName: any, proxyClass: typeof Proxy_2): void;
         }

         export declare class PullTowardsControlPoint extends SourceEngineParticleOperator {
             static functionName: string;
             constructor();
             doForce(particle: any, elapsedTime: any, accumulatedForces: any): void;
         }

         export declare class QuadraticBezierCurve extends Curve {
             p0: vec3;
             p1: vec3;
             p2: vec3;
             constructor(p0?: vec3, p1?: vec3, p2?: vec3);
             getPosition(t: any, out?: vec3): vec3;
         }

         /**
          * Same as quat.fromEuler with angles in radians
          */
         export declare function quatFromEulerRad(out: quat, x: number, y: number, z: number): quat;

         export declare function quatToEuler(out: any, q: any): any;

         export declare function quatToEulerDeg(out: any, q: any): any;

         export declare const RAD_TO_DEG: number;

         export declare class RadiusFromCPObject extends Operator {
             #private;
             _paramChanged(paramName: any, value: any): void;
             doInit(particle: any, elapsedTime: any): void;
         }

         export declare class RadiusRandom extends SourceEngineParticleOperator {
             static functionName: string;
             constructor();
             doInit(particle: any, elapsedTime: any): void;
         }

         export declare class RadiusScale extends SourceEngineParticleOperator {
             static functionName: string;
             constructor();
             doOperate(particle: any, elapsedTime: any): void;
         }

         export declare function radToDeg(rad: number): number;

         export declare class RampScalarLinear extends Operator {
             rateMin: number;
             rateMax: number;
             startTime_min: number;
             startTime_max: number;
             endTime_min: number;
             endTime_max: number;
             field: number;
             proportionalOp: boolean;
             _paramChanged(paramName: any, value: any): void;
             doOperate(particle: any, elapsedTime: any): void;
         }

         export declare class RampScalarLinearSimple extends Operator {
             rate: number;
             startTime: number;
             endTime: number;
             field: number;
             _paramChanged(paramName: any, value: any): void;
             doOperate(particle: any, elapsedTime: any): void;
         }

         export declare class RampScalarSpline extends Operator {
             rateMin: number;
             rateMax: number;
             startTime_min: number;
             startTime_max: number;
             endTime_min: number;
             endTime_max: number;
             field: number;
             proportionalOp: boolean;
             bias: number;
             easeOut: boolean;
             _paramChanged(paramName: any, value: any): void;
             doOperate(particle: any, elapsedTime: any): void;
         }

         export declare class RandomAlpha extends Operator {
             alphaMin: number;
             alphaMax: number;
             alphaRandExponent: number;
             _paramChanged(paramName: any, value: any): void;
             doInit(particle: any, elapsedTime: any): void;
         }

         export declare class RandomColor extends Operator {
             colorMin: vec3;
             colorMax: vec3;
             tintMin: vec3;
             tintMax: vec3;
             updateThreshold: number;
             tintCP: number;
             tintBlendMode: any;
             lightAmplification: number;
             tintPerc: number;
             _paramChanged(paramName: any, value: any): void;
             doInit(particle: any, elapsedTime: any): void;
         }

         export declare function RandomFloat(min: number, max: number): number;

         export declare function RandomFloatExp(min: number, max: number, exponent: number): number;

         export declare class RandomForce extends SourceEngineParticleOperator {
             static functionName: string;
             constructor();
             doForce(particle: any, elapsedTime: any, accumulatedForces: any): void;
         }

         export declare class RandomLifeTime extends Operator {
             lifetimeMin: number;
             lifetimeMax: number;
             lifetimeRandExponent: number;
             _paramChanged(paramName: any, value: any): void;
             doInit(particle: any, elapsedTime: any): void;
         }

         export declare class RandomRadius extends Operator {
             radiusMin: number;
             radiusMax: number;
             radiusRandExponent: number;
             _paramChanged(paramName: any, value: any): void;
             doInit(particle: any, elapsedTime: any): void;
         }

         export declare class RandomRotation extends Operator {
             radians: number;
             radiansMin: number;
             radiansMax: number;
             rotationRandExponent: number;
             randomlyFlipDirection: boolean;
             _paramChanged(paramName: any, value: any): void;
             doInit(particle: any, elapsedTime: any): void;
         }

         export declare class RandomRotationSpeed extends Operator {
             radians: number;
             radiansMin: number;
             radiansMax: number;
             rotationRandExponent: number;
             randomlyFlipDirection: boolean;
             _paramChanged(paramName: any, value: any): void;
             doInit(particle: any, elapsedTime: any): void;
         }

         export declare class RandomScalar extends Operator {
             min: number;
             max: number;
             exponent: number;
             fieldOutput: number;
             _paramChanged(paramName: any, value: any): void;
             doInit(particle: any, elapsedTime: any): void;
         }

         export declare class RandomSecondSequence extends Operator {
             sequenceMin: number;
             sequenceMax: number;
             _paramChanged(paramName: any, value: any): void;
             doInit(particle: any, elapsedTime: any): void;
         }

         export declare class RandomSequence extends Operator {
             sequenceMin: number;
             sequenceMax: number;
             _paramChanged(paramName: any, value: any): void;
             doInit(particle: any, elapsedTime: any): void;
         }

         export declare class RandomTrailLength extends Operator {
             minLength: number;
             maxLength: number;
             lengthRandExponent: number;
             _paramChanged(paramName: any, value: any): void;
             doInit(particle: any, elapsedTime: any): void;
         }

         export declare class RandomVector extends Operator {
             vecMin: vec3;
             vecMax: vec3;
             fieldOutput: number;
             _paramChanged(paramName: any, value: any): void;
             doInit(particle: any, elapsedTime: any): void;
         }

         export declare function RandomVectorInUnitSphere(out: vec3): number;

         export declare class RandomYaw extends Operator {
             radians: number;
             radiansMin: number;
             radiansMax: number;
             rotationRandExponent: number;
             randomlyFlipDirection: boolean;
             _paramChanged(paramName: any, value: any): void;
             doInit(particle: any, elapsedTime: any): void;
         }

         export declare class RandomYawFlip extends Operator {
             percent: number;
             _paramChanged(paramName: any, value: any): void;
             doInit(particle: any, elapsedTime: any): void;
             initMultipleOverride(): boolean;
         }

         export declare class Ray {
             origin: vec3;
             direction: vec3;
             constructor(origin?: vec3, direction?: vec3);
             set(origin: vec3, direction: vec3): void;
             copy(other: Ray): void;
             copyTransform(other: Ray, worldMatrix: mat4): void;
             setOrigin(origin: vec3): void;
             setDirection(direction: vec3): void;
             positionAt(distance: number, position: vec3): void;
             intersectTriangle(v0: vec3, v1: vec3, v2: vec3, intersectionPoint: vec3): boolean;
             intersectSphere(position: any, radius: any, scale: any, intersectionPoint1: any, intersectionPoint2: any): boolean;
             distanceSqToSegment(v0: any, v1: any, optionalPointOnRay: any, optionalPointOnSegment: any): any;
             createIntersection(position: any, normal: any, uv: any, entity: any, distanceFromRay: any): Intersection;
         }

         export declare class Raycaster {
             near: number;
             far: number;
             ray: Ray;
             constructor(near?: number, far?: number);
             castRay(origin: vec3, direction: vec3, entities: Array<Entity> | Set<Entity>, recursive: boolean): Intersection[];
             castCameraRay(camera: Camera, normalizedX: number, normalizedY: number, entities: Array<Entity> | Set<Entity>, recursive: boolean): Intersection[];
             intersectEntity(entity: Entity, intersections: Array<Intersection>, recursive: boolean): void;
         }

         export declare class RefractMaterial extends SourceEngineMaterial {
             clone(): RefractMaterial;
             getShaderSource(): string;
         }

         export declare class RemapControlPointDirectionToVector extends Operator {
             fieldOutput: number;
             scale: number;
             _paramChanged(paramName: any, value: any): void;
             doOperate(particle: any, elapsedTime: any): void;
         }

         export declare class RemapControlPointToScalar extends SourceEngineParticleOperator {
             static functionName: string;
             constructor();
             doInit(particle: any, elapsedTime: any): void;
             getInputValue(inputField: any, cpNumber: any): number;
             initMultipleOverride(): boolean;
         }

         export declare class RemapControlPointToVector extends SourceEngineParticleOperator {
             static functionName: string;
             constructor();
             doInit(particle: any, elapsedTime: any): void;
             getInputValue(inputField: any, cpNumber: any): number;
             initMultipleOverride(): boolean;
         }

         export declare class RemapCPOrientationToRotations extends Operator {
             #private;
             _paramChanged(paramName: any, value: any): void;
             doOperate(particle: any, elapsedTime: any, strength: any): void;
         }

         export declare class RemapCPSpeedToCP extends SourceEngineParticleOperator {
             static functionName: string;
             constructor();
             doOperate(particle: any, elapsedTime: any): void;
         }

         export declare class RemapCPtoScalar extends Operator {
             fieldOutput: number;
             cpInput: number;
             field: number;
             inputMin: number;
             inputMax: number;
             outputMin: number;
             outputMax: number;
             startTime: number;
             endTime: number;
             interpRate: number;
             setMethod: any;
             scaleInitialRange: any;
             _paramChanged(paramName: any, value: any): void;
             doOperate(particle: any, elapsedTime: any, strength: any): void;
         }

         export declare class RemapCPtoVector extends Operator {
             cpInput: number;
             inputMin: vec3;
             inputMax: vec3;
             outputMin: vec3;
             outputMax: vec3;
             startTime: number;
             endTime: number;
             setMethod: any;
             offset: boolean;
             accelerate: boolean;
             localSpaceCP: number;
             remapBias: number;
             scaleInitialRange: any;
             fieldOutput: number;
             _paramChanged(paramName: any, value: any): void;
             doInit(particle: any, elapsedTime: any, strength: any): void;
         }

         export declare class RemapDistanceToControlPointToScalar extends SourceEngineParticleOperator {
             static functionName: string;
             constructor();
             doOperate(particle: any, elapsedTime: any): void;
         }

         export declare class RemapDistanceToControlPointToVector extends SourceEngineParticleOperator {
             static functionName: string;
             constructor();
             doOperate(particle: any): void;
         }

         export declare class RemapInitialScalar extends SourceEngineParticleOperator {
             static functionName: string;
             constructor();
             doInit(particle: any, elapsedTime: any): void;
             initMultipleOverride(): boolean;
         }

         export declare class RemapNoiseToScalar extends SourceEngineParticleOperator {
             static functionName: string;
             constructor();
             doInit(particle: any, elapsedTime: any): void;
         }

         export declare class RemapParticleCountToScalar extends Operator {
             inputMin: number;
             inputMax: number;
             scaleControlPoint: number;
             scaleControlPointField: number;
             outputMin: number;
             outputMax: number;
             setMethod: any;
             activeRange: boolean;
             invert: boolean;
             wrap: boolean;
             remapBias: number;
             fieldOutput: number;
             _paramChanged(paramName: any, value: any): void;
             doInit(particle: any, elapsedTime: any): void;
         }

         export declare class RemapScalar extends SourceEngineParticleOperator {
             static functionName: string;
             constructor();
             doOperate(particle: any, elapsedTime: any): void;
         }

         export declare class RemapScalarToVector extends SourceEngineParticleOperator {
             static functionName: string;
             constructor();
             doInit(particle: SourceEngineParticle, elapsedTime: number): void;
             initMultipleOverride(): boolean;
         }

         export declare function RemapValClamped(val: number, A: number, B: number, C: number, D: number): number;

         export declare function RemapValClampedBias(val: number, A: number, B: number, C: number, D: number, bias: number): number;

         export declare class RemGenerator {
             #private;
             constructor(renderer: Renderer);
             fromScene(scene: Scene, sigma?: number, near?: number, far?: number): RenderTarget;
             /**
              * Generates a PMREM from an equirectangular texture, which can be either LDR
              * or HDR. The ideal input image size is 1k (1024 x 512),
              * as this matches best with the 256 x 256 cubemap output.
              */
             fromEquirectangular(equirectangular: Texture, renderTarget?: RenderTarget): RenderTarget;
             /**
              * Generates a PMREM from an cubemap texture, which can be either LDR
              * or HDR. The ideal input cube size is 256 x 256,
              * as this matches best with the 256 x 256 cubemap output.
              */
             fromCubemap(cubemap: CubeTexture, renderTarget?: RenderTarget): RenderTarget;
             /**
              * Pre-compiles the cubemap shader. You can get faster start-up by invoking this method during
              * your texture's network fetch for increased concurrency.
              */
             compileCubemapShader(): void;
             /**
              * Pre-compiles the equirectangular shader. You can get faster start-up by invoking this method during
              * your texture's network fetch for increased concurrency.
              */
             compileEquirectangularShader(): void;
             /**
              * Disposes of the PMREMGenerator's internal memory. Note that PMREMGenerator is a static class,
              * so you should not need more than one PMREMGenerator object. If you do, calling dispose() on
              * one of them will cause any others to also become unusable.
              */
             dispose(): void;
         }

         export declare class RenderAnimatedSprites extends SourceEngineParticleOperator {
             #private;
             static functionName: string;
             texture: Texture;
             geometry: BufferGeometry;
             imgData: any;
             constructor();
             updateParticles(particleSystem: any, particleList: any): void;
             set maxParticles(maxParticles: any);
             initRenderer(particleSystem: any): void;
             updateParticlesTexture(): void;
             setupParticlesTexture(particleList: any, maxParticles: any): void;
             dispose(): void;
         }

         declare class RenderBase extends Operator {
         }

         export declare class RenderBlobs extends Operator {
             balls: any[];
             metaballs: Metaballs;
             constructor(system: any);
             _paramChanged(paramName: any, value: any): void;
             initRenderer(particleSystem: any): void;
             updateParticles(particleSystem: any, particleList: any, elapsedTime: any): void;
         }

         export declare class Renderbuffer {
             #private;
             constructor(internalFormat: RenderBufferInternalFormat, width: number, height: number);
             resize(width: number, height: number): void;
             getRenderbuffer(): WebGLRenderbuffer;
             dispose(): void;
         }

         export declare enum RenderBufferInternalFormat {
             Rgba4 = 32854,
             Rgb565 = 36194,
             Rgb5_A1 = 32855,
             Depth_Component16 = 33189,
             Stencil_Index_8 = 36168,
             Depth_Stencil = 34041,
             R8 = 33321,
             R8I = 33329,
             R8UI = 33330,
             R16I = 33331,
             R16UI = 33332,
             R32I = 33333,
             R32UI = 33334,
             RG8 = 33323,
             RG8I = 33335,
             RG8UI = 33336,
             RG16I = 33337,
             RG16UI = 33338,
             RG32I = 33339,
             RG32UI = 33340,
             RGB8 = 32849,
             RGBA8 = 32856,
             SRGB8_ALPHA8 = 35907,
             RGB10_A2 = 32857,
             RGBA8UI = 36220,
             RGBA8I = 36238,
             RGB10_A2UI = 36975,
             RGBA16UI = 36214,
             RGBA16I = 36232,
             RGBA32I = 36226,
             RGBA32UI = 36208,
             DEPTH_COMPONENT24 = 33190,
             DEPTH_COMPONENT32F = 36012,
             DEPTH24_STENCIL8 = 35056,
             DEPTH32F_STENCIL8 = 36013
         }

         export declare class RenderDeferredLight extends Operator {
             constructor(system: any);
             _paramChanged(paramName: any, value: any): void;
             initRenderer(particleSystem: any): void;
             updateParticles(particleSystem: any, particleList: any, elapsedTime: any): void;
         }

         declare class Renderer {
             #private;
             constructor(graphics: Graphics);
             getProgram(mesh: Mesh, material: Material): Program;
             applyMaterial(program: any, material: any): void;
             setupLights(renderList: RenderList, camera: any, program: any, viewMatrix: any): void;
             setLights(pointLights: any, spotLights: any, pointLightShadows: any, spotLightShadows: any): void;
             unsetLights(): void;
             renderObject(renderList: RenderList, object: Mesh, camera: any, geometry: any, material: any, renderLights: boolean, lightPos: any): void;
             _prepareRenderList(renderList: any, scene: any, camera: any, delta: any): void;
             _renderRenderList(renderList: RenderList, camera: any, renderLights: any, lightPos?: any): void;
             render(scene: Scene, camera: Camera, delta: number): void;
             clear(color: any, depth: any, stencil: any): void;
             /**
              * Invalidate all shader (force recompile)
              */
             invalidateShaders(): void;
             clearColor(clearColor: any): void;
             clearDepth(clearDepth: any): void;
             clearStencil(clearStencil: any): void;
             setToneMapping(toneMapping: any): void;
             getToneMapping(): ToneMapping;
             setToneMappingExposure(exposure: any): void;
             getToneMappingExposure(): number;
         }

         export declare enum RenderFace {
             Both = 0,
             Front = 1,
             Back = 2,
             None = 3
         }

         declare class RenderList {
             lights: any[];
             pointLights: Array<PointLight>;
             spotLights: Array<SpotLight>;
             ambientLights: Array<AmbientLight>;
             transparentList: Array<Mesh>;
             opaqueList: Array<Mesh>;
             pointLightShadows: number;
             spotLightShadows: number;
             reset(): void;
             finish(): void;
             addObject(entity: Entity): void;
         }

         export declare class RenderModels extends Operator {
             #private;
             _paramChanged(paramName: any, value: any): void;
             initRenderer(particleSystem: any): void;
             updateParticles(particleSystem: any, particleList: any, elapsedTime: any): void;
             dispose(): void;
         }

         export declare class RenderPass extends Pass {
             scene: Scene;
             constructor(scene: Scene, camera: Camera);
             render(renderer: any, readBuffer: any, writeBuffer: any, renderToScreen: any, delta: any): void;
         }

         export declare class RenderRope extends SourceEngineParticleOperator {
             #private;
             static functionName: string;
             texture: Texture;
             geometry: BeamBufferGeometry;
             imgData: any;
             constructor();
             updateParticles(particleSystem: any, particleList: any): void;
             set maxParticles(maxParticles: any);
             initRenderer(particleSystem: any): void;
             updateParticlesTexture(): void;
             setupParticlesTexture(particleList: any, maxParticles: any): void;
             dispose(): void;
         }

         export declare class RenderRopes extends Operator {
             #private;
             geometry: BeamBufferGeometry;
             setDefaultTexture: boolean;
             textureVWorldSize: number;
             textureVScrollRate: number;
             textureScroll: number;
             spriteSheet: Source2SpriteSheet;
             texture: Texture;
             imgData: Float32Array;
             constructor(system: any);
             _paramChanged(paramName: any, value: any): void;
             setSequenceCombineMode(sequenceCombineMode: any): void;
             setTexture(texturePath: any): Promise<void>;
             updateParticles(particleSystem: any, particleList: any, elapsedTime: any): void;
             set maxParticles(maxParticles: any);
             initRenderer(particleSystem: any): void;
             _createParticlesArray(): void;
             createParticlesTexture(): void;
             updateParticlesTexture(): void;
             setupParticlesTexture(particleList: any, maxParticles: any): void;
             init(): void;
         }

         export declare class RenderScreenVelocityRotate extends SourceEngineParticleOperator {
             static functionName: string;
             isScreenVelocityRotate: boolean;
             constructor();
             updateParticles(particleSystem: any, particleList: any): void;
             initRenderer(particleSystem: any): void;
         }

         export declare class RenderSprites extends RenderBase {
             #private;
             geometry: BufferGeometry;
             setDefaultTexture: boolean;
             spriteSheet: Source2SpriteSheet;
             texture: Texture;
             imgData: Float32Array;
             constructor(system: any);
             _paramChanged(paramName: any, value: any): void;
             setSequenceCombineMode(sequenceCombineMode: any): void;
             setTexture(texturePath: any): Promise<void>;
             updateParticles(particleSystem: any, particleList: any, elapsedTime: any): void;
             set maxParticles(maxParticles: any);
             _initBuffers(): void;
             initRenderer(particleSystem: any): void;
             _createParticlesArray(): void;
             createParticlesTexture(): void;
             updateParticlesTexture(): void;
             setupParticlesTexture(particleList: any, maxParticles: any): void;
             init(): void;
         }

         export declare class RenderSpriteTrail extends SourceEngineParticleOperator {
             #private;
             static functionName: string;
             texture: Texture;
             geometry: BufferGeometry;
             imgData: any;
             constructor();
             updateParticles(particleSystem: any, particleList: any, elapsedTime: any): void;
             initRenderer(particleSystem: any): void;
             createParticlesArray(maxParticles: any): void;
             updateParticlesTexture(maxParticles: any, pixels: any): void;
             setupParticlesTexture(particleList: any, maxParticles: any, elapsedTime: any): void;
             setupParticlesTexture1(particleList: any, maxParticles: any, elapsedTime: any): void;
             dispose(): void;
         }

         export declare class RenderTarget {
             #private;
             constructor(params?: any);
             setDepthBuffer(depthBuffer: boolean): void;
             setScissorTest(scissorTest: boolean): void;
             getWidth(): number;
             getHeight(): number;
             getTexture(): AnyTexture;
             /**
              * @deprecated Please use `getTexture` instead.
              */
             get texture(): void;
             bind(): void;
             unbind(): void;
             resize(width: number, height: number): void;
             setViewport(x: number, y: number, width: number, height: number): void;
             clone(): RenderTarget;
             dispose(): void;
         }

         export declare class RenderTargetViewer {
             #private;
             isRenderTargetViewer: boolean;
             constructor(renderTarget: RenderTarget);
             /**
              * @deprecated Please use `setMaterial` instead.
              */
             set material(material: void);
             setRenderTarget(renderTarget: RenderTarget): void;
             setMaterial(material: Material): void;
             getMaterial(): Material;
             /**
              * @deprecated Please use `getMaterial` instead.
              */
             get material(): void;
             setPosition(x: number, y: number): void;
             setSize(x: number, y: number): void;
             refreshPlane(): void;
             render(renderer: Renderer): void;
             is(s: string): boolean;
         }

         export declare class RenderTrails extends Operator {
             #private;
             geometry: BufferGeometry;
             setDefaultTexture: boolean;
             minLength: number;
             maxLength: number;
             lengthFadeInTime: number;
             ignoreDT: boolean;
             lengthScale: number;
             spriteSheet: Source2SpriteSheet;
             texture: Texture;
             imgData: Float32Array;
             constructor(system: any);
             _paramChanged(paramName: any, value: any): void;
             setSequenceCombineMode(sequenceCombineMode: any): void;
             setTexture(texturePath: any): Promise<void>;
             updateParticles(particleSystem: any, particleList: any, elapsedTime: any): void;
             set maxParticles(maxParticles: any);
             _initBuffers(): void;
             initRenderer(particleSystem: any): void;
             _createParticlesArray(): void;
             createParticlesTexture(): void;
             updateParticlesTexture(): void;
             setupParticlesTexture(particleList: any, maxParticles: any, elapsedTime: any): void;
             init(): void;
         }

         export declare class Repositories {
             #private;
             constructor();
             addRepository(repo: Repository): void;
             getRepository(name: string): Repository;
             getRepositoryList(): string[];
             getFile(repositoryName: string, filepath: string): Promise<RepositoryArrayBufferResponse>;
             getFileAsText(repositoryName: string, filepath: string): Promise<RepositoryTextResponse>;
             getFileAsBlob(repositoryName: string, filepath: string): Promise<RepositoryBlobResponse>;
             getFileAsJson(repositoryName: string, filepath: string): Promise<RepositoryJsonResponse>;
         }

         export declare interface Repository {
             name: string;
             getFile: (filepath: string) => Promise<RepositoryArrayBufferResponse>;
             getFileAsText: (filepath: string) => Promise<RepositoryTextResponse>;
             getFileAsBlob: (filepath: string) => Promise<RepositoryBlobResponse>;
             getFileAsJson: (filepath: string) => Promise<RepositoryJsonResponse>;
             getFileList: (filter?: RepositoryFilter) => Promise<RepositoryFileListResponse>;
         }

         export declare type RepositoryArrayBufferResponse = {
             buffer?: ArrayBuffer | null;
             error?: RepositoryError;
         };

         export declare type RepositoryBlobResponse = {
             blob?: Blob | null;
             error?: RepositoryError;
         };

         export declare class RepositoryEntry {
             #private;
             constructor(repository: Repository, name: string, isDirectory: boolean);
             addEntry(filename: string): void;
             getName(): string;
             getFullName(): string;
             getParent(): RepositoryEntry | undefined;
             getRepository(): Repository;
             getChild(name: string): RepositoryEntry | undefined;
             getChilds(): Set<RepositoryEntry>;
             getAllChilds(filter?: RepositoryFilter): Set<RepositoryEntry>;
             isDirectory(): boolean;
             toJSON(): JSON;
             merge(other: RepositoryEntry): void;
         }

         export declare enum RepositoryError {
             FileNotFound = 1,
             UnknownError = 2,
             NotSupported = 3
         }

         export declare type RepositoryFileListResponse = {
             root?: RepositoryEntry;
             error?: RepositoryError;
         };

         export declare type RepositoryFilter = {
             name?: string | RegExp;
             extension?: string | RegExp;
             directories?: boolean;
             files?: boolean;
         };

         export declare type RepositoryJsonResponse = {
             json?: JSON | null;
             error?: RepositoryError;
         };

         export declare type RepositoryTextResponse = {
             text?: string | null;
             error?: RepositoryError;
         };

         export declare class RgbeImporter {
             #private;
             constructor(context: WebGLAnyRenderingContext);
             fetch(url: string): Promise<Texture | "error while fetching resource">;
             import(reader: BinaryReader): Texture;
         }

         export declare class RingWave extends Operator {
             evenDistribution: boolean;
             xyVelocityOnly: boolean;
             t: number;
             _paramChanged(paramName: any, value: any): void;
             doInit(particle: any, elapsedTime: any): void;
         }

         export declare class RotationBasic extends SourceEngineParticleOperator {
             static functionName: string;
             constructor();
             doOperate(particle: any, elapsedTime: any): void;
         }

         export declare class RotationControl extends Entity {
             #private;
             constructor(params?: any);
             set rotationSpeed(rotationSpeed: number);
             get rotationSpeed(): number;
             set axis(axis: vec3);
             get axis(): vec3;
             buildContextMenu(): {
                 visibility: {
                     i18n: string;
                     selected: boolean;
                     f: () => void;
                 };
                 remove: {
                     i18n: string;
                     f: () => void;
                 };
                 destroy: {
                     i18n: string;
                     f: () => void;
                 };
                 remove_more: {
                     i18n: string;
                     submenu: {
                         i18n: string;
                         f: () => void;
                     }[];
                 };
                 name: {
                     i18n: string;
                     f: () => void;
                 };
                 add: {
                     i18n: string;
                     submenu: any;
                 };
                 entitynull_1: any;
                 position: {
                     i18n: string;
                     f: () => void;
                 };
                 translate: {
                     i18n: string;
                     f: () => void;
                 };
                 reset_position: {
                     i18n: string;
                     f: () => vec3;
                 };
                 entitynull_2: any;
                 quaternion: {
                     i18n: string;
                     f: () => void;
                 };
                 rotate: {
                     i18n: string;
                     submenu: {
                         i18n: string;
                         f: () => void;
                     }[];
                 };
                 reset_rotation: {
                     i18n: string;
                     f: () => quat;
                 };
                 entitynull_3: any;
                 scale: {
                     i18n: string;
                     f: () => void;
                 };
                 reset_scale: {
                     i18n: string;
                     f: () => vec3;
                 };
                 entitynull_4: any;
                 wireframe: {
                     i18n: string;
                     selected: boolean;
                     f: () => void;
                 };
                 cast_shadows: {
                     i18n: string;
                     selected: boolean;
                     f: () => void;
                 };
                 receive_shadows: {
                     i18n: string;
                     selected: boolean;
                     f: () => void;
                 };
                 material: {
                     i18n: string;
                     submenu: {};
                 };
             } & {
                 RotationControl_1: any;
                 rotation_axis: {
                     i18n: string;
                     f: () => void;
                 };
                 rotation_speed: {
                     i18n: string;
                     f: () => void;
                 };
             };
         }

         export declare class RotationRandom extends SourceEngineParticleOperator {
             static functionName: string;
             constructor();
             doInit(particle: any, elapsedTime: any): void;
             initMultipleOverride(): boolean;
         }

         export declare class RotationSpeedRandom extends SourceEngineParticleOperator {
             static functionName: string;
             constructor();
             doInit(particle: any, elapsedTime: any): void;
         }

         /**
          * TODO
          */
         export declare class RotationSpinRoll extends SourceEngineParticleOperator {
             static functionName: string;
             constructor();
             doOperate(particle: any, elapsedTime: any): void;
         }

         export declare class RotationSpinYaw extends SourceEngineParticleOperator {
             static functionName: string;
             constructor();
             doOperate(particle: any, elapsedTime: any): void;
         }

         export declare class RotationYawFlipRandom extends SourceEngineParticleOperator {
             static functionName: string;
             constructor();
             doInit(particle: any, elapsedTime: any): void;
             initMultipleOverride(): boolean;
         }

         export declare class RotationYawRandom extends SourceEngineParticleOperator {
             static functionName: string;
             constructor();
             doInit(particle: any, elapsedTime: any): void;
         }

         export declare class SaturatePass extends Pass {
             #private;
             constructor(camera: any);
             set saturation(saturation: any);
             render(renderer: any, readBuffer: any, writeBuffer: any, renderToScreen: any): void;
         }

         export declare class Scene extends Entity {
             #private;
             background?: BackGround;
             layers: Set<unknown>;
             environment?: Environment;
             activeCamera?: Camera;
             constructor(parameters?: any);
             addLayer(layer: any, index: any): any;
             removeLayer(layer: any): void;
             setWorld(world: World): void;
             getWorld(): World;
             toString(): string;
             static constructFromJSON(json: any): Promise<Scene>;
             static getEntityName(): string;
             is(s: string): boolean;
         }

         export declare class SceneExplorer {
             #private;
             htmlFileSelector: HTMLElement;
             constructor();
             /**
              * @deprecated Please use `setScene` instead.
              */
             set scene(scene: Scene);
             setScene(scene: Scene): void;
             get scene(): Scene | undefined;
             get htmlElement(): Element;
             applyFilter(): void;
             selectEntity(entity: Entity): void;
             getSelectedEntity(): Entity;
             getEntityHtml(entity: Entity): void;
             showContextMenu(contextMenu: HarmonyContextMenuItems, x: number, y: number, entity: Entity): void;
             editMaterial(material: Material): void;
         }

         export declare class Select extends Node_2 {
             #private;
             constructor(editor: NodeImageEditor, params?: any);
             operate(context?: any): Promise<void>;
             get title(): string;
             toString(tabs?: string): Promise<string>;
             dispose(): void;
         }

         /**
          * SelectFirstIfNonZero Proxy
          */
         export declare class SelectFirstIfNonZero extends Proxy_2 {
             #private;
             init(): void;
             execute(variables: any): void;
             isNonZero(value: any): boolean;
         }

         export declare class SequenceLifeTime extends Operator {
             doInit(particles: any, elapsedTime: any): void;
         }

         export declare class SequenceRandom extends SourceEngineParticleOperator {
             static functionName: string;
             constructor();
             doInit(particle: any, elapsedTime: any): void;
         }

         export declare class SetChildControlPointsFromParticlePositions extends SourceEngineParticleOperator {
             static functionName: string;
             constructor();
             doOperate(particle: any, elapsedTime: any): void;
         }

         export declare class SetControlPointFromObjectScale extends Operator {
             cpInput: number;
             cpOutput: number;
             _paramChanged(paramName: any, value: any): void;
             doOperate(particle: any, elapsedTime: any): void;
             isPreEmission(): boolean;
         }

         export declare class SetControlPointOrientation extends Operator {
             useWorldLocation: boolean;
             randomize: boolean;
             setOnce: boolean;
             cp: number;
             headLocation: number;
             rotation: vec3;
             rotationB: vec3;
             _paramChanged(paramName: any, value: any): void;
             doOperate(particle: any, elapsedTime: any): void;
             isPreEmission(): boolean;
         }

         export declare class SetControlPointPositions extends SourceEngineParticleOperator {
             static functionName: string;
             constructor();
             doOperate(particle: any): void;
         }

         export declare class SetControlPointsToModelParticles extends Operator {
             #private;
             hitboxSetName: string;
             firstControlPoint: number;
             numControlPoints: number;
             firstSourcePoint: number;
             skin: boolean;
             _paramChanged(paramName: any, value: any): void;
             doOperate(particle: any, elapsedTime: any): void;
         }

         export declare class SetControlPointToCenter extends Operator {
             cp1: number;
             cp1Pos: vec3;
             _paramChanged(paramName: any, value: any): void;
             doOperate(particle: any, elapsedTime: any): void;
             isPreEmission(): boolean;
         }

         export declare class SetControlPointToParticlesCenter extends SourceEngineParticleOperator {
             static functionName: string;
             constructor();
             doOperate(particle: any, elapsedTime: any): void;
         }

         export declare class SetCPOrientationToGroundNormal extends Operator {
             m_flInterpRate: number;
             maxTraceLength: number;
             tolerance: number;
             traceOffset: number;
             collisionGroupName: string;
             inputCP: number;
             outputCP: number;
             includeWater: boolean;
             _paramChanged(paramName: any, value: any): void;
             doOperate(particle: any, elapsedTime: any): void;
         }

         export declare function setCustomIncludeSource(name: string, source: string): void;

         export declare function setFetchFunction(func: FetchFunction): void;

         export declare class SetFloat extends Operator {
             normalizePerLiving: boolean;
             outputField: number;
             setMethod: string;
             _paramChanged(paramName: any, value: any): void;
             doOperate(particle: any, elapsedTime: any): void;
         }

         export declare class SetParentControlPointsToChildCP extends Operator {
             childGroupID: number;
             childControlPoint: number;
             numControlPoints: number;
             firstSourcePoint: number;
             setOrientation: boolean;
             _paramChanged(paramName: any, value: any): void;
             doOperate(particle: any, elapsedTime: any): void;
             isPreEmission(): boolean;
         }

         export declare class SetPerChildControlPoint extends Operator {
             childGroupID: number;
             firstControlPoint: number;
             numControlPoints: number;
             setOrientation: boolean;
             numBasedOnParticleCount: boolean;
             _paramChanged(paramName: any, value: any): void;
             doOperate(particle: any, elapsedTime: any): void;
         }

         export declare class SetRandomControlPointPosition extends Operator {
             useWorldLocation: boolean;
             orient: boolean;
             cp1: number;
             headLocation: number;
             cpMinPos: vec3;
             cpMaxPos: vec3;
             lastRandomTime: number;
             _paramChanged(paramName: any, value: any): void;
             doOperate(particle: any, elapsedTime: any): void;
             isPreEmission(): boolean;
         }

         export declare class SetRigidAttachment extends Operator {
             localSpace: boolean;
             fieldOutput: number;
             fieldInput: number;
             _paramChanged(paramName: any, value: any): void;
             doInit(particle: any, elapsedTime: any): void;
         }

         export declare class SetSingleControlPointPosition extends Operator {
             useWorldLocation: boolean;
             setOnce: boolean;
             cp1: number;
             headLocation: number;
             set: boolean;
             _paramChanged(paramName: any, value: any): void;
             reset(): void;
             doOperate(particle: any, elapsedTime: any): void;
             isPreEmission(): boolean;
         }

         export declare function setTextureFactoryContext(c: WebGLAnyRenderingContext): void;

         export declare class SetToCP extends Operator {
             offset: vec3;
             offsetLocal: boolean;
             _paramChanged(paramName: any, value: any): void;
             doOperate(particle: any, elapsedTime: any): void;
         }

         export declare class SetVec extends Operator {
             outputField: number;
             setMethod: string;
             normalizePerLiving: boolean;
             _paramChanged(paramName: any, value: any): void;
             doOperate(particle: any, elapsedTime: any): void;
         }

         export declare enum ShaderDebugMode {
             None = 0
         }

         export declare class ShaderEditor extends HTMLElement {
             #private;
             initEditor(options?: any): void;
             get editorShaderName(): string;
             set editorShaderName(shaderName: string);
             get editorIncludeName(): string;
             set editorIncludeName(includeName: string);
             recompile(): void;
             setAnnotations(shaderName: string): void;
             set recompileDelay(delay: number);
             set annotationsDelay(delay: number);
         }

         export declare class ShaderManager {
             #private;
             static addSource(type: ShaderType, name: string, source: string): void;
             static getShaderSource(type: ShaderType, name: string, invalidCustomShaders?: boolean): WebGLShaderSource | undefined;
             static setCustomSource(type: ShaderType, name: string, source: string): void;
             static getCustomSourceAnnotations(name: string): any[];
             static getIncludeAnnotations(includeName: string): any;
             static get shaderList(): MapIterator<string>;
             static resetShadersSource(): void;
             static set displayCompileError(displayCompileError: boolean);
             static get displayCompileError(): boolean;
             static setCompileError(shaderName: string, shaderInfoLog: string): void;
         }

         export declare class ShaderMaterial extends Material {
             #private;
             constructor(params?: any);
             getShaderSource(): string;
             set shaderSource(shaderSource: any);
         }

         export declare enum ShaderPrecision {
             Low = 0,
             Medium = 1,
             High = 2
         }

         export declare enum ShaderQuality {
             Low = 0,
             Medium = 1,
             High = 2
         }

         export declare const Shaders: {
             [key: string]: string;
         };

         export declare class ShaderToyMaterial extends Material {
             constructor(params?: any);
             getShaderSource(): string;
         }

         declare enum ShaderType {
             Vertex = 35633,
             Fragment = 35632
         }

         export declare class ShadowMap {
             #private;
             constructor(graphics: Graphics);
             render(renderer: any, renderList: any, camera: any): void;
         }

         export declare function SimpleSpline(value: number): number;

         export declare class Sine extends Proxy_2 {
             #private;
             init(): void;
             execute(variables: any, proxyParams: any, time: any): void;
         }

         export declare class SkeletalMesh extends Mesh {
             #private;
             isSkeletalMesh: boolean;
             skeleton: Skeleton;
             skinnedVertexPosition: any;
             skinnedVertexNormal: any;
             constructor(geometry: any, material: any, skeleton: any);
             set bonesPerVertex(bonesPerVertex: number);
             get bonesPerVertex(): number;
             exportObj(): {
                 f?: Uint8Array | Uint32Array;
                 v?: Float32Array;
                 vn?: Float32Array;
                 vt?: Float32Array;
             };
             getRandomPointOnModel(vec: any, initialVec: any, bones: any): {};
             getBoundingBox(boundingBox?: BoundingBox): BoundingBox;
             toString(): string;
             prepareRayCasting(): void;
             raycast(raycaster: any, intersections: any): void;
             static getEntityName(): string;
         }

         export declare class Skeleton extends Entity {
             #private;
             isSkeleton: boolean;
             _bones: Array<Bone>;
             _dirty: boolean;
             lastComputed: number;
             constructor(params?: any);
             dirty(): void;
             getTexture(): Texture;
             setBonesMatrix(): void;
             set position(position: vec3);
             get position(): vec3;
             set quaternion(quaternion: vec4);
             get quaternion(): vec4;
             addBone(boneId: number, boneName: string): any;
             setParentSkeleton(skeleton: Skeleton): Promise<void>;
             getBoneByName(boneName: string): any;
             getBoneById(boneId: number): Bone;
             toString(): string;
             getBoundingBox(boundingBox?: BoundingBox): BoundingBox;
             get bones(): Bone[];
             reset(): void;
             toJSON(): any;
             static constructFromJSON(json: JSONObject, entities: Map<string, Entity | Material>, loadedPromise: Promise<void>): Promise<Skeleton>;
             dispose(): void;
             static getEntityName(): string;
         }

         export declare class SkeletonHelper extends Entity {
             #private;
             enumerable: boolean;
             constructor(parameters: any);
             parentChanged(parent: any): void;
             getWorldPosition(vec?: vec3): vec3;
             getWorldQuaternion(q?: quat): quat;
             get wireframe(): number;
             dispose(): void;
         }

         export declare class SketchPass extends Pass {
             constructor(camera: any);
             render(renderer: any, readBuffer: any, writeBuffer: any, renderToScreen: any): void;
         }

         export declare class SnapshotRigidSkinToBones extends Operator {
             transformNormals: boolean;
             _paramChanged(paramName: any, value: any): void;
             doOperate(particle: any, elapsedTime: any): void;
         }

         export declare class Source1ModelInstance extends Entity implements Animated {
             #private;
             isSource1ModelInstance: boolean;
             animable: boolean;
             hasAnimations: true;
             sourceModel: SourceModel;
             bodyParts: {
                 [key: string]: Entity;
             };
             sequences: {
                 [key: string]: {
                     frame?: number;
                     startTime?: any;
                     s?: any;
                 };
             };
             meshes: Set<Mesh | SkeletalMesh>;
             frame: number;
             anim: SourceAnimation;
             animationSpeed: number;
             isDynamic: boolean;
             static useNewAnimSystem: boolean;
             useNewAnimSystem: boolean;
             constructor(params?: any);
             get skeleton(): Skeleton;
             set skeleton(skeleton: Skeleton);
             addChild(child: any): Entity;
             removeChild(child: any): void;
             set skin(skin: number);
             get skin(): number;
             setSkin(skin: any): Promise<void>;
             set sheen(sheen: any);
             set tint(tint: any);
             getTint(out?: vec4): vec4 | undefined;
             setPoseParameter(paramName: any, paramValue: any): void;
             playAnimation(name: string): void;
             setAnimation(id: number, name: string, weight: number): Promise<void>;
             playSequence(sequenceName: string): void;
             addAnimation(id: number, animationName: string, weight?: number): Promise<void>;
             update(scene: any, camera: any, delta: any): void;
             _playSequences(delta: number): void;
             setMaterialOverride(materialOverride: any): Promise<void>;
             getBoneById(boneId: any): Bone;
             renderBodyParts(render: any): void;
             renderBodyPart(bodyPartName: any, render: any): void;
             resetBodyPartModels(): void;
             setBodyPartIdModel(bodyPartId: string, modelId: number): void;
             setBodyPartModel(bodyPartName: string, modelId: number): void;
             getBodyGroups(): Map<string, number>;
             toString(): string;
             attachSystem(system: any, attachementName?: string, cpIndex?: number, offset?: vec3): void;
             attachSystemToBone(system: any, boneName: any, offset: any): void;
             getAttachement(attachementName: any): any;
             getBoneByName(boneName: any): any;
             set material(material: any);
             buildContextMenu(): {
                 visibility: {
                     i18n: string;
                     selected: boolean;
                     f: () => void;
                 };
                 remove: {
                     i18n: string;
                     f: () => void;
                 };
                 destroy: {
                     i18n: string;
                     f: () => void;
                 };
                 remove_more: {
                     i18n: string;
                     submenu: {
                         i18n: string;
                         f: () => void;
                     }[];
                 };
                 name: {
                     i18n: string;
                     f: () => void;
                 };
                 add: {
                     i18n: string;
                     submenu: any;
                 };
                 entitynull_1: any;
                 position: {
                     i18n: string;
                     f: () => void;
                 };
                 translate: {
                     i18n: string;
                     f: () => void;
                 };
                 reset_position: {
                     i18n: string;
                     f: () => vec3;
                 };
                 entitynull_2: any;
                 quaternion: {
                     i18n: string;
                     f: () => void;
                 };
                 rotate: {
                     i18n: string;
                     submenu: {
                         i18n: string;
                         f: () => void;
                     }[];
                 };
                 reset_rotation: {
                     i18n: string;
                     f: () => quat;
                 };
                 entitynull_3: any;
                 scale: {
                     i18n: string;
                     f: () => void;
                 };
                 reset_scale: {
                     i18n: string;
                     f: () => vec3;
                 };
                 entitynull_4: any;
                 wireframe: {
                     i18n: string;
                     selected: boolean;
                     f: () => void;
                 };
                 cast_shadows: {
                     i18n: string;
                     selected: boolean;
                     f: () => void;
                 };
                 receive_shadows: {
                     i18n: string;
                     selected: boolean;
                     f: () => void;
                 };
                 material: {
                     i18n: string;
                     submenu: {};
                 };
             } & {
                 Source1ModelInstance_1: any;
                 skin: {
                     i18n: string;
                     submenu: any[];
                 };
                 tint: {
                     i18n: string;
                     f: (entity: any) => Promise<vec4>;
                 };
                 reset_tint: {
                     i18n: string;
                     f: (entity: any) => any;
                     disabled: boolean;
                 };
                 animation: {
                     i18n: string;
                     f: (entity: any) => Promise<void>;
                 };
                 overrideallmaterials: {
                     i18n: string;
                     f: (entity: any) => Promise<void>;
                 };
                 Source1ModelInstance_2: any;
                 animate: {
                     i18n: string;
                     selected: boolean;
                     f: () => 0 | 1;
                 };
                 frame: {
                     i18n: string;
                     f: () => void;
                 };
                 Source1ModelInstance_3: any;
                 copy_filename: {
                     i18n: string;
                     f: () => Promise<void>;
                 };
             };
             getParentModel(): this;
             getRandomPointOnModel(vec: any, initialVec: any, bones: any): any;
             set position(position: vec3);
             get position(): vec3;
             set quaternion(quaternion: vec4);
             get quaternion(): vec4;
             static set animSpeed(speed: any);
             setFlexes(flexes?: {}): void;
             resetFlexParameters(): void;
             playDefaultAnim(): Promise<void>;
             getHitboxes(): any[];
             replaceMaterial(material: any, recursive?: boolean): void;
             resetMaterial(recursive?: boolean): void;
             getAnimations(): Promise<Set<string>>;
             toJSON(): any;
             static constructFromJSON(json: any, entities: any, loadedPromise: any): Promise<Entity>;
             fromJSON(json: any): void;
             dispose(): void;
             static getEntityName(): string;
             is(s: any): boolean;
         }

         export declare class Source1ModelManager {
             #private;
             static createInstance(repository: string, fileName: string, dynamic: boolean, preventInit?: boolean): Promise<Source1ModelInstance>;
             static loadManifest(repositoryName: string): void;
             static getModelList(): Promise<FileSelectorFile>;
         }

         /**
          * Multiply proxy. Copies the value of a variable to another.
          * @comment input variable name: srcvar1
          * @comment input variable name: srcvar2
          * @comment ouput variable name: resultVar
          */
         export declare class Source1Multiply extends Proxy_2 {
             init(): void;
             execute(variables: any): void;
         }

         export declare class Source1ParticleControler {
             #private;
             static speed: number;
             static visible?: boolean;
             static fixedTime?: number;
             static setParticleConstructor(ps: typeof SourceEngineParticleSystem): void;
             /**
              * Reset all active systems
              */
             static resetAll(): void;
             /**
              * Step systems
              * @param {Number} elapsedTime Step time
              */
             static stepSystems(elapsedTime: number): void;
             /**
              * Add system TODO
              * @param {Number} elapsedTime Step time
              */
             static addSystem2(system: SourceEngineParticleSystem): void;
             /**
              * Create system
              * @param {Number} elapsedTime Step time
              */
             static createSystem(repository: string, systemName: string): Promise<SourceEngineParticleSystem>;
             static loadManifest(repository: string): Promise<void>;
             /**
              * Start all systems
              */
             static startAll(): void;
             /**
              * Stop all systems
              */
             static stopAll(): void;
             /**
              * Set a system active
              */
             static setActive(system: SourceEngineParticleSystem): void;
             /**
              * Set a system inactive
              */
             static setInactive(system: SourceEngineParticleSystem): void;
             static setSpeed(s: number): void;
             static getSystemList(): Promise<FileSelectorFile>;
             static set renderSystems(renderSystems: boolean);
         }

         export declare class Source1SoundManager {
             #private;
             /**
              * Play a sound
              * @param {String} soundName soundName
              */
             static playSound(repositoryName: string, soundName: string): Promise<HTMLAudioElement>;
             /**
              * Load soundManifest
              */
             static loadManifest(repositoryName: string, fileName: string): void;
             static mute(): void;
             static unmute(): void;
         }

         export declare const Source1TextureManager: Source1TextureManagerClass;

         declare class Source1TextureManagerClass extends EventTarget {
             #private;
             fallbackRepository: string;
             constructor();
             getTexture(repository: any, path: any, frame: any, needCubeMap?: boolean, srgb?: boolean): any;
             getTextureAsync(repository: any, path: any, frame: any, needCubeMap: any, defaultTexture: any, srgb?: boolean): Promise<any>;
             getInternalTextureName(): string;
             addInternalTexture(texture?: Texture): {
                 name: string;
                 texture: Texture;
             };
             setTexture(path: any, texture: any): void;
             removeTexture(path: any): void;
         }

         declare class Source2Animation {
             #private;
             animGroup: any;
             filePath: any;
             file: any;
             decoderArray: any;
             segmentArray: any;
             frameData: any;
             constructor(animGroup: any, filePath: any);
             setFile(sourceFile: any): void;
             setAnimDatas(data: any): void;
             getAnimDesc(name: any): any;
             getDecodeKey(): any;
             getDecoderArray(): any;
             getSegment(segmentIndex: any): any;
             getAnimations(animations?: Set<unknown>): Promise<Set<unknown>>;
             getAnimationByActivity(activityName: any, activityModifiers: any): any[];
             getAnimationsByActivity(activityName: any): any[];
             get animArray(): any;
             getAnimationByName(animName: any): any;
         }

         declare class Source2Animations {
             #private;
             addAnimations(animations: any): void;
             getAnimations(): any[];
             getAnimation(activityName: any, activityModifiers?: Set<unknown>): any;
             getBestAnimation(activityName: any, activityModifiers: any): any;
         }

         declare class Source2AnimGroup {
             #private;
             repository: string;
             file: any;
             decoderArray: any;
             localAnimArray: any;
             decodeKey: any;
             directHSeqGroup: any;
             loaded: boolean;
             constructor(source2Model: any, repository: string);
             setFile(sourceFile: any): void;
             setAnimationGroupResourceData(localAnimArray: any, decodeKey: any): void;
             getAnim(animIndex: any): any;
             getAnimDesc(name: any): any;
             matchActivity(activity: any, modifiers: any): any;
             getAnims(): Set<Source2Animation>;
             getAnimationsByActivity(activityName: any): any[];
             getDecodeKey(): any;
             get source2Model(): any;
             getAnimationByName(animName: any): any;
             set _changemyname(_changemyname: any[]);
             get _changemyname(): any[];
         }

         export declare const Source2AnimLoader: {
             loadingSlot: number;
             pending: {};
             fileName: string;
             animGroupName: string;
             animName: string;
             loadAnimGroup(source2Model: any, repository: any, animGroupName: any): Promise<Source2AnimGroup>;
             getVagrp(repository: any, animGroupName: any, animGroup: any): Promise<unknown>;
             loadAnim(repository: any, animName: any, animGroup: any): Promise<Source2Animation>;
             getVanim(repository: any, animName: any, anim: any): Promise<unknown>;
             loadVagrp(repository: any, fileName: any, fileContent: any, animGroup: any): Promise<void>;
             loadVanim(repository: any, fileName: any, fileContent: any, anim: any): Promise<void>;
             loadSequenceGroup(repository: any, seqGroupName: any, animGroup: any): Promise<Source2SeqGroup>;
             getVseq(repository: any, seqGroupName: any, seqGroup: any): Promise<unknown>;
             loadVseq(repository: any, fileName: any, fileContent: any, seqGroup: any): Promise<void>;
         };

         export declare class Source2Crystal extends Source2Material {
             setupUniformsOnce(): void;
             getShaderSource(): string;
         }

         export declare class Source2CsgoCharacter extends Source2Material {
             get shaderSource(): string;
         }

         export declare class Source2CsgoComplex extends Source2Material {
             get shaderSource(): string;
         }

         export declare class Source2CsgoEffects extends Source2Material {
             get shaderSource(): string;
         }

         export declare class Source2CsgoEnvironment extends Source2Material {
             get shaderSource(): string;
         }

         export declare class Source2CsgoEnvironmentBlend extends Source2Material {
             get shaderSource(): string;
         }

         export declare class Source2CsgoFoliage extends Source2Material {
             get shaderSource(): string;
         }

         export declare class Source2CsgoGlass extends Source2Material {
             get shaderSource(): string;
         }

         export declare class Source2CsgoSimple extends Source2Material {
             get shaderSource(): string;
         }

         export declare class Source2CsgoStaticOverlay extends Source2Material {
             get shaderSource(): string;
         }

         export declare class Source2CsgoUnlitGeneric extends Source2Material {
             get shaderSource(): string;
         }

         export declare class Source2CsgoVertexLitGeneric extends Source2Material {
             get shaderSource(): string;
         }

         export declare class Source2CsgoWeapon extends Source2Material {
             get shaderSource(): string;
         }

         export declare class Source2CsgoWeaponStattrak extends Source2Material {
             _afterProcessProxies(proxyParams: any): void;
             get shaderSource(): string;
         }

         export declare class Source2EnvironmentBlend extends Source2Material {
             get shaderSource(): string;
         }

         export declare class Source2Error extends Source2Material {
             constructor(repository: string, source2File?: Source2File);
             get shaderSource(): string;
         }

         /**
          * Source2 common file
          */
         declare class Source2File {
             repository: string;
             fileName: string;
             blocks: any;
             blocksArray: Array<Source2FileBlock>;
             constructor(repository: string, fileName: string);
             addBlock(block: Source2FileBlock): void;
             getBlockByType(type: any): any;
             getBlockById(id: any): Source2FileBlock;
             getVertexCount(bufferId: any): any;
             getIndices(bufferId: any): any;
             getVertices(bufferId: any): any;
             getNormals(bufferId: any): any[];
             getCoords(bufferId: any): any;
             getBoneIndices(bufferId: any): any;
             getBoneWeight(bufferId: any): any;
             getPositionArray(bufferId: any): any[];
             getNormalArray(bufferId: any): any[];
             getCoordArray(bufferId: any): any[];
             getBoneIndiceArray(bufferId: any): any[];
             getBoneWeightArray(bufferId: any): any[];
             getTangentArray(bufferId: any): any[];
             getBinormalArray(bufferId: any): any[];
             getWidth(): any;
             getHeight(): any;
             getDxtLevel(): 0 | 1 | 5;
             isCompressed(): boolean;
             isCubeTexture(): boolean;
             getBlockStruct(path: any): any;
             getPermModelData(path: any): any;
             getMaterialResourceData(path: any): any;
             getExternalFiles(): any;
             getExternalFile(fileIndex: any): any;
             getKeyValue(path: any): any;
             get imageFormat(): any;
             get displayName(): string;
             getRemappingTable(meshIndex: any): any;
             remapBuffer(buffer: any, remappingTable: any): Float32Array<ArrayBuffer>;
         }

         /**
          * Source2 common file block
          */
         declare class Source2FileBlock {
             file: any;
             type: any;
             offset: any;
             length: any;
             indices: any;
             vertices: any;
             keyValue: any;
             constructor(file: any, type: any, offset: any, length: any);
             getKeyValue(path: any): any;
             getIndices(bufferId: any): any;
             getVertices(bufferId: any): any;
             getNormalsTangents(bufferId: any): any[][];
             getCoords(bufferId: any): any;
             getNormal(bufferId: any): any;
             getTangent(bufferId: any): any;
             getBoneIndices(bufferId: any): any;
             getBoneWeight(bufferId: any): any;
         }

         export declare class Source2FileLoader extends SourceBinaryLoader {
             #private;
             vtex: any;
             constructor(vtex?: any);
             parse(repository: any, fileName: any, arrayBuffer: any): Promise<Source2File>;
         }

         export declare class Source2Generic extends Source2Material {
             get shaderSource(): string;
         }

         export declare class Source2GlobalLitSimple extends Source2Material {
             getShaderSource(): string;
         }

         export declare class Source2Hero extends Source2Material {
             get shaderSource(): string;
         }

         export declare class Source2HeroFluid extends Source2Material {
             get shaderSource(): string;
         }

         export declare class Source2InitRemapCPtoScalar extends Operator {
             cpInput: number;
             field: number;
             inputMin: number;
             inputMax: number;
             outputMin: number;
             outputMax: number;
             startTime: number;
             endTime: number;
             setMethod: any;
             remapBias: number;
             scaleInitialRange: any;
             fieldOutput: number;
             _paramChanged(paramName: any, value: any): void;
             doInit(particle: any, elapsedTime: any, strength: any): void;
         }

         export declare class Source2LifespanDecay extends Operator {
             _paramChanged(paramName: any, value: any): void;
             doOperate(particle: any, elapsedTime: any): void;
         }

         export declare class Source2LockToBone extends Operator {
             hitboxSetName: string;
             lifeTimeFadeStart: number;
             lifeTimeFadeEnd: number;
             jumpThreshold: number;
             prevPosScale: number;
             rigid: boolean;
             useBones: boolean;
             rotationSetType: any;
             rigidRotationLock: boolean;
             _paramChanged(paramName: any, value: any): void;
             doOperate(particle: any, elapsedTime: any): void;
         }

         export declare class Source2Material extends Material {
             #private;
             repository: string;
             constructor(repository: string, source2File?: Source2File);
             setupUniformsOnce(): void;
             setupUniforms(): void;
             clone(): Source2Material;
             getTextureByName(textureName: any): any;
             updateMaterial(time: any, mesh: any): void;
             processProxies(time: any, proxyParams: any): void;
             _afterProcessProxies(proxyParams: any): void;
             setDynamicUniform(uniformName: any): void;
             afterProcessProxies(proxyParams: any): void;
             setUniform(uniformName: any, uniformValue: any): void;
             initFloatUniforms(): void;
             initVectorUniforms(): void;
             initTextureUniforms(): Promise<void>;
             getParam(paramName: any): any;
             getIntParam(intName: any): any;
             getFloatParam(floatName: any): any;
             getVectorParam(vectorName: any): any;
             getDynamicParam(dynamicName: any): any;
         }

         export declare class Source2MaterialManager {
             #private;
             static addMaterial(material: Source2Material): void;
             static removeMaterial(material: any): void;
             static getMaterial(repository: any, fileName: any, searchPaths?: any): Promise<Source2Material>;
         }

         declare class Source2Model {
             #private;
             repository: string;
             vmdl: any;
             requiredLod: number;
             drawBodyPart: {};
             currentSkin: number;
             currentSheen: any;
             animLayers: any[];
             animGroups: Set<Source2AnimGroup>;
             materialRepository: any;
             dirty: boolean;
             geometries: Set<unknown>;
             bodyParts: Map<any, any>;
             attachements: Map<any, any>;
             seqGroup: any;
             bodyGroups: Set<string>;
             bodyGroupsChoices: Set<BodyGroupChoice>;
             constructor(repository: string, vmdl: any);
             matchActivity(activity: any, modifiers: any): any;
             addGeometry(geometry: any, bodyPartName: any, bodyPartModelId: any): void;
             createInstance(isDynamic: any): Source2ModelInstance;
             getBodyNumber(bodygroups: any): number;
             getBones(): any;
             getSkinMaterials(skin: any): any;
             getSkinList(): any[];
             loadAnimGroups(): Promise<void>;
             getIncludeModels(): any;
             addIncludeModel(includeModel: any): void;
             getAnim(activityName: any, activityModifiers: any): any;
             getAnimation(name: any): any;
             getAnimationsByActivity(activityName: any, animations?: Source2Animations): Source2Animations;
             getAnimations(): Promise<Set<string>>;
             _addAttachements(attachements: any): void;
             getAnimationByName(animName: any): any;
         }

         export declare class Source2ModelInstance extends Entity implements Animated {
             #private;
             isSource2ModelInstance: boolean;
             animable: boolean;
             bodyParts: {};
             poseParameters: {};
             meshes: Set<Mesh>;
             attachements: Map<any, any>;
             activity: string;
             activityModifiers: Set<unknown>;
             sequences: {};
             mainAnimFrame: number;
             animationSpeed: number;
             sourceModel: Source2Model;
             hasAnimations: true;
             constructor(sourceModel: Source2Model, isDynamic: any);
             setBodyGroup(name: string, choice: number): void;
             get skeleton(): any;
             set position(position: vec3);
             get position(): vec3;
             addChild(child: any): Entity;
             removeChild(child: any): void;
             set skin(skin: number);
             get skin(): number;
             setLOD(lod: number): void;
             setPoseParameter(paramName: any, paramValue: any): void;
             playSequence(activity: any, activityModifiers?: any[]): void;
             playAnimation(name: any): void;
             setAnimation(id: number, name: string, weight: number): Promise<void>;
             setActivityModifiers(activityModifiers?: any[]): void;
             update(scene: any, camera: any, delta: any): void;
             getAnimations(): Promise<Set<string>>;
             buildContextMenu(): {
                 visibility: {
                     i18n: string;
                     selected: boolean;
                     f: () => void;
                 };
                 remove: {
                     i18n: string;
                     f: () => void;
                 };
                 destroy: {
                     i18n: string;
                     f: () => void;
                 };
                 remove_more: {
                     i18n: string;
                     submenu: {
                         i18n: string;
                         f: () => void;
                     }[];
                 };
                 name: {
                     i18n: string;
                     f: () => void;
                 };
                 add: {
                     i18n: string;
                     submenu: any;
                 };
                 entitynull_1: any;
                 position: {
                     i18n: string;
                     f: () => void;
                 };
                 translate: {
                     i18n: string;
                     f: () => void;
                 };
                 reset_position: {
                     i18n: string;
                     f: () => vec3;
                 };
                 entitynull_2: any;
                 quaternion: {
                     i18n: string;
                     f: () => void;
                 };
                 rotate: {
                     i18n: string;
                     submenu: {
                         i18n: string;
                         f: () => void;
                     }[];
                 };
                 reset_rotation: {
                     i18n: string;
                     f: () => quat;
                 };
                 entitynull_3: any;
                 scale: {
                     i18n: string;
                     f: () => void;
                 };
                 reset_scale: {
                     i18n: string;
                     f: () => vec3;
                 };
                 entitynull_4: any;
                 wireframe: {
                     i18n: string;
                     selected: boolean;
                     f: () => void;
                 };
                 cast_shadows: {
                     i18n: string;
                     selected: boolean;
                     f: () => void;
                 };
                 receive_shadows: {
                     i18n: string;
                     selected: boolean;
                     f: () => void;
                 };
                 material: {
                     i18n: string;
                     submenu: {};
                 };
             } & {
                 Source2ModelInstance_1: any;
                 skin: {
                     i18n: string;
                     submenu: any[];
                 };
                 animation: {
                     i18n: string;
                     f: (entity: any) => Promise<void>;
                 };
                 Source2ModelInstance_2: any;
                 animate: {
                     i18n: string;
                     selected: boolean;
                     f: () => 0 | 1;
                 };
                 frame: {
                     i18n: string;
                     f: () => void;
                 };
             };
             getParentModel(): this;
             getRandomPointOnModel(vec: any, initialVec: any, bones: any): any;
             getAttachement(name: any): any;
             static set animSpeed(speed: any);
             dispose(): void;
             static getEntityName(): string;
         }

         export declare class Source2ModelLoader {
             #private;
             load(repositoryName: any, fileName: any): any;
             testProcess2(vmdl: any, model: any, repository: any): Promise<Entity>;
             _loadExternalMeshes(group: any, vmdl: any, model: any, repository: any): Promise<void>;
             loadMeshes(vmdl: any, callback: any): Promise<void>;
         }

         export declare class Source2ModelManager {
             #private;
             static instances: Set<unknown>;
             static createInstance(repository: any, fileName: any, dynamic: any): Promise<any>;
             static loadManifest(repositoryName: any): Promise<void>;
             static getModelList(): Promise<FileSelectorFile>;
         }

         export declare class Source2MovementRotateParticleAroundAxis extends Operator {
             localSpace: boolean;
             _paramChanged(paramName: any, value: any): void;
             doOperate(particle: any, elapsedTime: any): void;
         }

         export declare class Source2OscillateScalar extends Operator {
             rateMin: number;
             rateMax: number;
             frequencyMin: number;
             frequencyMax: number;
             field: number;
             proportional: boolean;
             proportionalOp: boolean;
             startTimeMin: number;
             startTimeMax: number;
             endTimeMin: number;
             endTimeMax: number;
             oscMult: number;
             oscAdd: number;
             _paramChanged(paramName: any, value: any): void;
             doOperate(particle: any, elapsedTime: any): void;
         }

         export declare class Source2OscillateVector extends Operator {
             rateMin: vec3;
             rateMax: vec3;
             frequencyMin: vec3;
             frequencyMax: vec3;
             field: number;
             proportional: boolean;
             proportionalOp: boolean;
             offset: boolean;
             startTimeMin: number;
             startTimeMax: number;
             endTimeMin: number;
             endTimeMax: number;
             oscMult: number;
             oscAdd: number;
             _paramChanged(paramName: any, value: any): void;
             doOperate(particle: any, elapsedTime: any): void;
         }

         export declare const Source2ParticleLoader: {
             load(repository: any, fileName: any): Promise<unknown>;
             getSystem(repository: any, vpcf: any, snapshotModifiers?: any): Promise<Source2ParticleSystem>;
         };

         export declare const Source2ParticleManager: Source2ParticleManagerClass;

         declare class Source2ParticleManagerClass {
             #private;
             speed: number;
             activeSystemList: Set<Source2ParticleSystem>;
             visible: boolean;
             constructor();
             getSystem(repository: any, vpcfPath: any, snapshotModifiers?: any): Promise<any>;
             stepSystems(elapsedTime: any): void;
             setActive(system: Source2ParticleSystem): void;
             setInactive(system: Source2ParticleSystem): void;
             set renderSystems(renderSystems: any);
             getSystemList(): Promise<FileSelectorFile>;
             loadManifests(...repositories: any[]): Promise<void>;
         }

         export declare class Source2ParticleSystem extends Entity {
             #private;
             isParticleSystem: boolean;
             isSource2ParticleSystem: boolean;
             fileName: string;
             repository: string;
             animable: boolean;
             resetable: boolean;
             speed: number;
             isRunning: boolean;
             startAfterDelay: number;
             preEmissionOperators: any[];
             emitters: any[];
             initializers: any[];
             operators: any[];
             forces: any[];
             constraints: any[];
             renderers: any[];
             controlPoints: any[];
             childSystems: any[];
             livingParticles: any[];
             poolParticles: any[];
             minBounds: vec3;
             maxBounds: vec3;
             particleCount: number;
             initialParticles: number;
             disabled: boolean;
             baseProperties: any;
             firstStep: boolean;
             currentTime: number;
             elapsedTime: number;
             previousElapsedTime: number;
             maxParticles: number;
             currentParticles: number;
             resetDelay: number;
             parentSystem?: Source2ParticleSystem;
             isBounded: boolean;
             constructor(repository: string, fileName: string, name: string);
             init(snapshotModifiers?: any): Promise<void>;
             start(): void;
             stop(): void;
             stopChildren(): void;
             do(action: any, params: any): void;
             reset(): void;
             step(elapsedTime: any): void;
             stepControlPoint(): void;
             createParticle(creationTime: any, elapsedTime: any): any;
             getWorldPosition(vec?: vec3): vec3;
             getWorldQuaternion(q?: quat): quat;
             getControlPoint(controlPointId: any): any;
             getControlPointForScale(controlPointId: any): any;
             getOwnControlPoint(controlPointId: any): any;
             getControlPointPosition(cpId: any): any;
             setControlPointPosition(cpId: any, position: any): void;
             setMaxParticles(max: any): void;
             stepConstraints(particle: any): void;
             getBounds(minBounds: any, maxBounds: any): void;
             getBoundsCenter(center: any): void;
             parentChanged(parent?: any): void;
             setParentModel(model: any): void;
             getParentModel(): any;
             getParticle(index: any): any;
             dispose(): void;
             buildContextMenu(): {
                 visibility: {
                     i18n: string;
                     selected: boolean;
                     f: () => void;
                 };
                 remove: {
                     i18n: string;
                     f: () => void;
                 };
                 destroy: {
                     i18n: string;
                     f: () => void;
                 };
                 remove_more: {
                     i18n: string;
                     submenu: {
                         i18n: string;
                         f: () => void;
                     }[];
                 };
                 name: {
                     i18n: string;
                     f: () => void;
                 };
                 add: {
                     i18n: string;
                     submenu: any;
                 };
                 entitynull_1: any;
                 position: {
                     i18n: string;
                     f: () => void;
                 };
                 translate: {
                     i18n: string;
                     f: () => void;
                 };
                 reset_position: {
                     i18n: string;
                     f: () => vec3;
                 };
                 entitynull_2: any;
                 quaternion: {
                     i18n: string;
                     f: () => void;
                 };
                 rotate: {
                     i18n: string;
                     submenu: {
                         i18n: string;
                         f: () => void;
                     }[];
                 };
                 reset_rotation: {
                     i18n: string;
                     f: () => quat;
                 };
                 entitynull_3: any;
                 scale: {
                     i18n: string;
                     f: () => void;
                 };
                 reset_scale: {
                     i18n: string;
                     f: () => vec3;
                 };
                 entitynull_4: any;
                 wireframe: {
                     i18n: string;
                     selected: boolean;
                     f: () => void;
                 };
                 cast_shadows: {
                     i18n: string;
                     selected: boolean;
                     f: () => void;
                 };
                 receive_shadows: {
                     i18n: string;
                     selected: boolean;
                     f: () => void;
                 };
                 material: {
                     i18n: string;
                     submenu: {};
                 };
             } & {
                 Source2ParticleSystem_1: any;
                 startStop: {
                     i18n: string;
                     f: () => void;
                 };
                 reset: {
                     i18n: string;
                     f: () => void;
                 };
             };
             static getEntityName(): string;
         }

         export declare class Source2Pbr extends Source2Material {
             get shaderSource(): string;
         }

         export declare class Source2RandomForce extends Operator {
             minForce: vec3;
             maxForce: vec3;
             _paramChanged(paramName: any, value: any): void;
             doForce(particle: any, elapsedTime: any, accumulatedForces: any): void;
         }

         declare class Source2SeqGroup {
             #private;
             sequences: any[];
             file: any;
             m_localS1SeqDescArray: any;
             animArray: any;
             loaded: boolean;
             constructor(animGroup: any);
             setFile(sourceFile: any): void;
             getAnimDesc(name: any): any;
             matchActivity(activity: any, modifiers: any): any;
             getAnimationsByActivity(activityName: any): any[];
             getDecodeKey(): any;
             getDecoderArray(): any;
             get localSequenceNameArray(): any;
         }

         export declare class Source2SetControlPointPositions extends Operator {
             useWorldLocation: boolean;
             orient: boolean;
             cp: number[];
             cpPos: Array<vec3>;
             headLocation: number;
             setOnce: boolean;
             _paramChanged(paramName: any, value: any): void;
             doOperate(particle: any, elapsedTime: any): void;
             isPreEmission(): boolean;
         }

         declare class Source2Snapshot {
             particleCount: number;
             attributes: any;
             file: any;
             setParticleCount(particleCount: number): void;
         }

         export declare const Source2SnapshotLoader: {
             load(repository: any, fileName: any): Promise<Source2Snapshot>;
             loadSnapshot(snapFile: any): Source2Snapshot;
         };

         export declare class Source2SpringMeteor extends Source2Material {
             get shaderSource(): string;
         }

         export declare class Source2SpriteCard extends Source2Material {
             #private;
             constructor(repository: string, source2File?: Source2File);
             setOutputBlendMode(outputBlendMode: any): void;
             setTexturePath(texturePath: any): Promise<void>;
             initTextureUniforms(): Promise<void>;
             getFrameSpan(sequence: any): number;
             getShaderSource(): string;
         }

         declare class Source2SpriteSheet {
             sequences: Array<Source2SpriteSheetSequence>;
             addSequence(): Source2SpriteSheetSequence;
             getFrame(sequenceId: any, frame: any): Source2SpriteSheetFrame;
         }

         declare class Source2SpriteSheetFrame {
             coords: vec4;
             duration: number;
         }

         declare class Source2SpriteSheetSequence {
             duration: number;
             frames: Array<Source2SpriteSheetFrame>;
             addFrame(): Source2SpriteSheetFrame;
         }

         export declare const Source2TextureManager: Source2TextureManagerClass;

         declare class Source2TextureManagerClass extends EventTarget {
             #private;
             WEBGL_compressed_texture_s3tc: any;
             EXT_texture_compression_bptc: any;
             EXT_texture_compression_rgtc: any;
             constructor();
             getTexture(repository: any, path: any, frame: any): Promise<any>;
             getTextureSheet(repository: string, path: string): Promise<Source2SpriteSheet | undefined>;
             setTexture(path: any, texture: any): void;
             fillTexture(texture: any, imageFormat: any, width: any, height: any, datas: any, target: any): void;
             fillTextureDxt(texture: any, imageFormat: any, width: any, height: any, datas: any, target: any): void;
         }

         export declare class Source2UI extends Source2Material {
             get shaderSource(): string;
         }

         export declare class Source2Unlit extends Source2Material {
             get shaderSource(): string;
         }

         export declare class Source2VelocityRandom extends Operator {
             ignoreDT: boolean;
             _paramChanged(paramName: any, value: any): void;
             doInit(particle: any, elapsedTime: any): void;
             initMultipleOverride(): boolean;
         }

         export declare class Source2VrBlackUnlit extends Source2Material {
             get shaderSource(): string;
         }

         export declare class Source2VrComplex extends Source2Material {
             get shaderSource(): string;
         }

         export declare class Source2VrEyeball extends Source2Material {
             get shaderSource(): string;
         }

         export declare class Source2VrGlass extends Source2Material {
             get shaderSource(): string;
         }

         export declare class Source2VrMonitor extends Source2Material {
             get shaderSource(): string;
         }

         export declare class Source2VrSimple extends Source2Material {
             get shaderSource(): string;
         }

         export declare class Source2VrSimple2WayBlend extends Source2Material {
             get shaderSource(): string;
         }

         export declare class Source2VrSimple3LayerParallax extends Source2Material {
             get shaderSource(): string;
         }

         export declare class Source2VrSkin extends Source2Material {
             get shaderSource(): string;
         }

         export declare class Source2VrXenFoliage extends Source2Material {
             get shaderSource(): string;
         }

         declare class SourceAnimation {
             position: vec3;
             boneRot: vec3;
             quaternion: quat;
             tempPos: vec3;
             tempRot: vec3;
             constructor(sourceModel?: any);
             animate2(dynamicProp: any, poseParameters: any, position: any, orientation: any, sequences: any): void;
         }

         declare class SourceBinaryLoader {
             repository: string;
             load(repositoryName: string, fileName: string): Promise<Source2File | SourceMDL | SourceBSP>;
             parse(repository: string, fileName: string, arrayBuffer: ArrayBuffer): Promise<Source2File | any> | SourceVVD | SourceVTX | SourceEngineVTF | SourcePCF | SourceMDL | SourceBSP;
         }

         export declare class SourceBSP extends World {
             #private;
             repository: string;
             bspFileVersion: any;
             lumps: any[];
             mapRevision: any;
             loaded: boolean;
             bufferInitialized: boolean;
             staticGeometry: {};
             skyBoxStaticGeometry: {};
             skyboxGeometry: {};
             overlayVerticesByTexture: {};
             mainLightMap: any;
             lightMapTexture: any;
             skyCamera: any;
             skyName: any;
             entities: any[];
             connections: any[];
             mapSpawn: boolean;
             lastLeaf: any;
             bspTree: SourceEngineBspTree;
             frameCount: number;
             mustParseHeader: boolean;
             funcBrushesRemoveMe: any[];
             partialLoading: boolean;
             eventTarget: EventTarget;
             staticProps: Group;
             dynamicProps: Group;
             mapFaces: Group;
             characterSpawn: any;
             loader: any;
             constructor(params?: any);
             initMap(): void;
             _createEntities(): void;
             _createStaticProps(): void;
             createDynamicEntities(kv: any): void;
             addLump(lump: any): void;
             getLumpData(lumpType: any): any;
             initFaceGeometry(face: any, position?: any): void;
             initDispGeometry(dispInfo: any, face: any): void;
             initGeometry(): void;
             addEntity(entity: any): void;
             addConnection(connection: any): void;
             getOBBSize(modelIndex: any): vec3;
             static getEntityName(): string;
         }

         export declare class SourceEngineBSPLoader extends SourceBinaryLoader {
             #private;
             parse(repository: any, fileName: any, arrayBuffer: any): SourceBSP;
             _parseLumpDirectory(reader: any, bsp: any): void;
         }

         /**
          * BSP Tree
          */
         declare class SourceEngineBspTree {
             map: SourceBSP;
             visibilityClusters: any;
             clustersCount: number;
             countRemoveMe: number;
             leavesRemoveme: any[];
             constructor(map: SourceBSP);
             set clusters(clusters: any);
             getLeafId(pos: any): number;
             isLeafVisible(fromLeafId: any, toLeafId: any): any;
             isVisLeaf(leafId: any): boolean;
             addPropToLeaf(leafId: any, propId: any): void;
         }

         declare class SourceEngineMaterial extends Material {
             #private;
             repository: string;
             fileName: string;
             proxyParams: any;
             proxies: Array<Proxy_2>;
             variables: Map<string, any>;
             numFrames: number;
             frameX: number;
             frameY: number;
             sequenceLength: number;
             constructor(params?: any);
             setNumFrames(frames: any, frameX: any, frameY: any, sequenceLength: any): void;
             getTexCoords(flCreationTime: any, flCurTime: any, flAgeScale: any, nSequence: any): any;
             getFrameSpan(sequence: any): any;
             /**
              * Init proxies
              * @param proxies {Array} List of proxies
              */
             initProxies(proxies: any): void;
             updateMaterial(time: any, mesh: any): void;
             /**
              * Process proxies
              * @param proxyParams {Object} Param passed to proxies
              */
             processProxies(time: any, proxyParams?: {}): void;
             _afterProcessProxies(proxyParams: any): void;
             afterProcessProxies(proxyParams: any): void;
             getAlpha(): number;
             computeModulationColor(out: any): any;
             getDefaultParameters(): {};
             sanitizeValue(parameterName: any, value: any): any;
             setKeyValue(key: any, value: any): void;
         }

         export declare class SourceEngineMaterialManager {
             #private;
             static getMaterial(repositoryName: any, fileName: any, searchPaths?: any): Promise<SourceEngineMaterial>;
             static copyMaterial(repositoryName: any, sourcePath: any, destPath: any, searchPaths: any): Promise<void>;
             static addRepository(repositoryPath: any): void;
             static getMaterialList(): Promise<{
                 files: any[];
             }>;
         }

         export declare class SourceEngineMDLLoader extends SourceBinaryLoader {
             #private;
             parse(repository: any, fileName: any, arrayBuffer: any): SourceMDL;
             _parseAnimSection(reader: any, animDesc: any, frameIndex: any): any[];
         }

         /**
          * TODO
          */
         declare class SourceEngineParticle {
             currentTime: number;
             previousElapsedTime: number;
             name: string;
             id: any;
             isAlive: boolean;
             position: vec3;
             prevPosition: vec3;
             cpPosition: vec3;
             cpOrientation: quat;
             cpOrientationInvert: quat;
             velocity: vec3;
             color: Color;
             initialColor: Color;
             uMin: number;
             uMax: number;
             vMin: number;
             vMax: number;
             system: SourceEngineParticleSystem;
             cTime: number;
             timeToLive: number;
             initialTimeToLive: number;
             proportionOfLife: number;
             u: number;
             v: number;
             radius: number;
             initialRadius: number;
             rotationRoll: number;
             initialRoll: number;
             rotationSpeedRoll: number;
             rotationYaw: number;
             startAlpha: number;
             alpha: number;
             alpha2: number;
             sequence: number;
             initialSequence: number;
             frame: number;
             PositionFromParentParticles: boolean;
             posLockedToCP: boolean;
             rotLockedToCP: boolean;
             trailLength: number;
             initialCPPosition: any;
             initialCPQuaternion: any;
             renderScreenVelocityRotate: boolean;
             constructor(id: any, system: any);
             step(elapsedTime: any): void;
             start(): void;
             die(): void;
             reset(): void;
             setInitialField(field: any, value: any, mulInitial: any): void;
             setField(field: number, value: any, mulInitial?: boolean, setInitial?: boolean): void;
             /**
              * TODO
              */
             getField(field?: number, initial?: boolean): number;
             /**
              * TODO
              */
             setInitialSequence(sequence: any): void;
             /**
              * TODO
              */
             setInitialRadius(radius: any): void;
             /**
              * TODO
              */
             setInitialTTL(timeToLive: any): void;
             /**
              * TODO
              */
             setInitialColor(color: any): void;
             /**
              * Set particle initial rotation roll.
              * @param {Number} roll Initial rotation roll.
              */
             setInitialRoll(roll: any): void;
             /**
              * Get particle world position
              * @param {vec3|null} The receiving vector. Created if null.
              * @return {vec3} The world position.
              */
             getWorldPos(worldPos: any): any;
             /**
              * Get particle world position
              * @param {vec3|null} The receiving vector. Created if null.
              * @return {vec3} The world position.
              */
             getLocalPos(worldPos: any): any;
         }

         declare class SourceEngineParticleOperator {
             #private;
             particleSystem: SourceEngineParticleSystem;
             material: Material;
             materialLoaded: boolean;
             paramList: Array<ParamType>;
             endCapState: number;
             mesh: Mesh;
             constructor();
             get functionName(): string;
             static get functionName(): string;
             static getFunctionName(): string;
             initializeParticle(particle: any, elapsedTime: any): void;
             operateParticle(particle: any, elapsedTime: any): void;
             forceParticle(particle: any, elapsedTime: any, accumulatedForces: any): void;
             constraintParticle(particle: any): void;
             doEmit(elapsedTime: number): void;
             doInit(particle: SourceEngineParticle, elapsedTime: number): void;
             doOperate(particle: SourceEngineParticle, elapsedTime: number): void;
             doForce(particle: SourceEngineParticle, elapsedTime: number, accumulatedForces: any, strength?: number): void;
             applyConstraint(particle: SourceEngineParticle): void;
             doRender(particle: SourceEngineParticle[], elapsedTime: number, material: Material): void;
             initRenderer(particleSystem: SourceEngineParticleSystem): void;
             emitParticle(creationTime: any, elapsedTime: any): any;
             renderParticle(particleList: any, elapsedTime: any, material: any): void;
             setMaterial(material: any): void;
             setParticleSystem(particleSystem: any): void;
             paramChanged(name: any, value: any): void;
             setParameter(parameter: any, type: any, value: any): this;
             getParameter(parameter: any): any;
             getParameters(): {};
             setParameters(parameters: any): this;
             setNameId(name: any): void;
             doNothing(): void;
             reset(): void;
             getOperatorFade(): number;
             getOperatorStrength(): number;
             getParamList(): ParamType[];
             addParam(param: any, type: any, value: any): void;
             getInputValue(inputField: any, particle: any): any;
             getInputValueAsVector(inputField: any, particle: any, v: any): void;
             setOutputValue(outputField: any, value: any, particle: any): void;
             initMultipleOverride(): boolean;
             finished(): boolean;
             setOrientationType(orientationType: any): void;
             dispose(): void;
         }

         export declare class SourceEngineParticleOperators {
             #private;
             static getOperator(name: any): any;
             static getOperators(type: any): any;
             static registerOperator(name: any, className?: any): void;
         }

         export declare class SourceEngineParticleSystem extends Entity implements Loopable {
             #private;
             isParticleSystem: boolean;
             repository: string;
             isLoopable: true;
             animable: boolean;
             resetable: boolean;
             paramList: Array<ParamType>;
             parameters: {
                 [key: string]: {
                     type?: string;
                     value?: string;
                 };
             };
             minimumTickRate: number;
             maximumTickRate: number;
             initialParticles: number;
             currentParticles: number;
             currentTime: number;
             elapsedTime: number;
             previousElapsedTime: number;
             speed: number;
             isRunning: boolean;
             radius: number;
             attachementBone: any;
             livingParticles: any[];
             poolParticles: any[];
             currentOrientation: quat;
             prevOrientation: quat;
             emitters: {
                 [key: string]: SourceEngineParticleOperator;
             };
             initializers: {
                 [key: string]: SourceEngineParticleOperator;
             };
             operators: {
                 [key: string]: SourceEngineParticleOperator;
             };
             forces: Map<any, any>;
             constraints: {
                 [key: string]: SourceEngineParticleOperator;
             };
             controlPoints: Array<ControlPoint>;
             childrenSystems: Array<SourceEngineParticleSystem>;
             tempChildren: {
                 [key: string]: string;
             };
             operatorRandomSampleOffset: number;
             parentSystem?: SourceEngineParticleSystem;
             firstStep: boolean;
             pcf?: SourcePCF;
             material?: SourceEngineMaterial;
             materialName?: string;
             maxParticles: number;
             resetDelay: number;
             snapshot: any;
             constructor(params?: any);
             start(): void;
             stop(): void;
             stopChildren(): void;
             do(action: string, params: any): void;
             reset(): void;
             updateChilds(): void;
             step(elapsedTime: number): void;
             /**
              * Step forces for each particle.
              */
             stepForces(): void;
             stepConstraints(particle: SourceEngineParticle): void;
             createParticle(creationTime: number, elapsedTime: number): any;
             getWorldPosition(vec?: vec3): vec3;
             stepControlPoint(): void;
             setParam(element: CDmxAttribute): this;
             addParam(param: string, type: string, value: any): void;
             setParameter(parameter: string, type: string, value: any): this;
             propertyChanged(name: string): void;
             getParameter(parameterName: string): any;
             setMaxParticles(max: number): void;
             setRadius(radius: number): void;
             setInitialParticles(initial: number): void;
             setMinimumTickRate(minimum: number): void;
             setMaximumTickRate(maximum: number): void;
             setMaterialName(materialName: string): void;
             setSnapshot(snapshot: any): void;
             addSub(type: string, object: SourceEngineParticleOperator, id: string): void;
             addEmitter(emitter: SourceEngineParticleOperator, id: string): void;
             addInitializer(initializer: SourceEngineParticleOperator, id: string): void;
             addOperator(operator: SourceEngineParticleOperator, id: string): void;
             removeOperator(id: string): void;
             addForce(force: SourceEngineParticleOperator, id: string): void;
             addConstraint(constraint: SourceEngineParticleOperator, id: string): void;
             addRenderer(renderer: SourceEngineParticleOperator, id: string): void;
             getControlPoint(controlPointId: number): ControlPoint | null;
             getOwnControlPoint(controlPointId: number): ControlPoint;
             addTempChild(name: string, id: string): void;
             addChildSystem(particleSystem: SourceEngineParticleSystem): void;
             setParent(parentSystem: SourceEngineParticleSystem): SourceEngineParticleSystem;
             /**
              * Orient all particles relative to control point #0.
              */
             setCpOrientation(): void;
             /**
              * Set control point orientation
              * @param (Object quat) orientation New orientation
              */
             setOrientation(orientation: quat): void;
             setChildControlPointPosition(first: number, last: number, position: vec3): void;
             getParticle(index?: number): any;
             getControlPointPosition(cpId: number): vec3;
             setControlPointPosition(cpId: number, position: vec3): void;
             setControlPointParent(controlPointId: number, parentControlPointId: number): void;
             getWorldQuaternion(q?: quat): quat;
             getBoundingBox(boundingBox?: BoundingBox): BoundingBox;
             set autoKill(autoKill: boolean);
             get autoKill(): boolean;
             setlooping(looping: boolean): void;
             getlooping(): boolean;
             dispose(): void;
             getBounds(min?: vec3, max?: vec3): void;
             static setSpeed(speed: number): void;
             static setSimulationSteps(simulationSteps: number): void;
             buildContextMenu(): {
                 visibility: {
                     i18n: string;
                     selected: boolean;
                     f: () => void;
                 };
                 remove: {
                     i18n: string;
                     f: () => void;
                 };
                 destroy: {
                     i18n: string;
                     f: () => void;
                 };
                 remove_more: {
                     i18n: string;
                     submenu: {
                         i18n: string;
                         f: () => void;
                     }[];
                 };
                 name: {
                     i18n: string;
                     f: () => void;
                 };
                 add: {
                     i18n: string;
                     submenu: any;
                 };
                 entitynull_1: any;
                 position: {
                     i18n: string;
                     f: () => void;
                 };
                 translate: {
                     i18n: string;
                     f: () => void;
                 };
                 reset_position: {
                     i18n: string;
                     f: () => vec3;
                 };
                 entitynull_2: any;
                 quaternion: {
                     i18n: string;
                     f: () => void;
                 };
                 rotate: {
                     i18n: string;
                     submenu: {
                         i18n: string;
                         f: () => void;
                     }[];
                 };
                 reset_rotation: {
                     i18n: string;
                     f: () => quat;
                 };
                 entitynull_3: any;
                 scale: {
                     i18n: string;
                     f: () => void;
                 };
                 reset_scale: {
                     i18n: string;
                     f: () => vec3;
                 };
                 entitynull_4: any;
                 wireframe: {
                     i18n: string;
                     selected: boolean;
                     f: () => void;
                 };
                 cast_shadows: {
                     i18n: string;
                     selected: boolean;
                     f: () => void;
                 };
                 receive_shadows: {
                     i18n: string;
                     selected: boolean;
                     f: () => void;
                 };
                 material: {
                     i18n: string;
                     submenu: {};
                 };
             } & {
                 SourceEngineParticleSystem_1: any;
                 startStop: {
                     i18n: string;
                     f: () => void;
                 };
                 reset: {
                     i18n: string;
                     f: () => void;
                 };
             };
             toJSON(): any;
             static constructFromJSON(json: any, entities: Map<string, Entity>, loadedPromise: Promise<void>): Promise<SourceEngineParticleSystem>;
             static getEntityName(): string;
         }

         export declare class SourceEnginePCFLoader extends SourceBinaryLoader {
             #private;
             parse(repositoryName: any, fileName: any, arrayBuffer: any): SourcePCF;
             getString(pcf: any, index: any): any;
             getElement(pcf: any, index: any): any;
         }

         export declare const SourceEngineVMTLoader: SourceEngineVMTLoaderClass;

         declare class SourceEngineVMTLoaderClass {
             #private;
             load(repositoryName: any, fileName: any): Promise<unknown>;
             parse(resolve: any, repositoryName: any, fileName: any, fileContent: any): void;
             setMaterial(fileName: any, fileContent: any): void;
             registerMaterial(materialName: any, materialClass: any): void;
         }

         declare class SourceEngineVTF {
             #private;
             repository: string;
             fileName: string;
             versionMaj: number;
             versionMin: number;
             width: any;
             height: any;
             flags: any;
             frames: any;
             faceCount: number;
             firstFrame: any;
             reflectivity: any;
             bumpmapScale: any;
             highResImageFormat: any;
             mipmapCount: any;
             lowResImageFormat: any;
             lowResImageWidth: any;
             lowResImageHeight: any;
             depth: any;
             resEntries: any[];
             currentFrame: number;
             filled: boolean;
             numResources: any;
             headerSize: any;
             constructor(repository: string, fileName: string);
             setVerionMin(value: number): void;
             /**
              * TODO
              */
             setFlags(flags: any): void;
             getAlphaBits(): 0 | 8 | 1;
             /**
              * TODO
              */
             setVerionMaj(value: any): void;
             /**
              * TODO
              */
             isHigherThan71(): boolean;
             /**
              * TODO
              */
             isHigherThan72(): boolean;
             /**
              * TODO
              */
             isHigherThan73(): boolean;
             /**
              * TODO
              */
             isHigherThan74(): boolean;
             /**
              * TODO
              */
             getResource(type: any): any;
             /**
              * TODO
              */
             getImageDatas(mipmapLvl: any): any;
             fillTexture(graphics: any, glContext: any, texture: any, mipmapLvl: any, frame1?: number, srgb?: boolean): void;
             /**
              * TODO
              */
             getDxtFormat(s3tc: any): any;
             /**
              * TODO
              */
             getFormat(glContext: any): 0 | 6407 | 6408;
             /**
              * TODO
              */
             getType(glContext: any): 5121 | 5126;
             /**
              * Return whether the texture is compressed or not
              * @return {bool} true if texture is dxt compressed
              */
             isDxtCompressed(): boolean;
             isSRGB(): boolean;
         }

         export declare class SourceEngineVTXLoader extends SourceBinaryLoader {
             #private;
             constructor(mdlVersion: number);
             parse(repository: any, fileName: any, arrayBuffer: any): SourceVTX;
         }

         export declare class SourceEngineVVDLoader extends SourceBinaryLoader {
             #private;
             parse(repository: any, fileName: any, arrayBuffer: any): SourceVVD;
         }

         declare class SourceMDL {
             #private;
             repository: string;
             readonly externalMdlsV2: any[];
             readonly attachementNames: {};
             readonly flexController: FlexController;
             readonly skinReferences: Array<Array<any>>;
             readonly textures: Array<MdlTexture>;
             readonly modelGroups: Array<MdlStudioModelGroup>;
             header: any;
             readonly bodyParts: Array<MdlBodyPart>;
             readonly sequences: Array<MdlStudioSeqDesc>;
             readonly texturesDir: string[];
             readonly flexRules: any[];
             readonly flexControllers: Array<MdlStudioFlexController>;
             boneCount: number;
             readonly bones: Array<MdlBone>;
             readonly boneNames: string[];
             numflexdesc: number;
             readonly attachements: Array<MdlAttachement>;
             readonly animDesc: any[];
             loader: SourceEngineMDLLoader;
             reader: BinaryReader;
             readonly poseParameters: any[];
             hitboxSets: any[];
             constructor(repository: string);
             getMaterialName(skinId: any, materialId: any, materialOverride?: any[]): any;
             getSkinList(): any[];
             getBodyPart(bodyPartId: any): MdlBodyPart;
             getBodyParts(): MdlBodyPart[];
             getSequence(sequenceName: any): Promise<MdlStudioSeqDesc>;
             getModelGroup(modelGroupId: any): MdlStudioModelGroup;
             getModelGroups(): MdlStudioModelGroup[];
             getExternalMdlCount(): number;
             getExternalMdl(externalId: any): Promise<SourceMDL | null>;
             getTextureDir(): string[];
             getDimensions(out?: vec3): vec3;
             getBBoxMin(out?: vec3): vec3;
             getBBoxMax(out?: vec3): vec3;
             getAnimList(): Promise<Set<string>>;
             getFlexRules(): any[];
             getFlexControllers(): MdlStudioFlexController[];
             runFlexesRules(flexesWeight: any, g_flexdescweight: any): void;
             addExternalMdl(mdlName: any): void;
             getBoneCount(): number;
             getBones(): MdlBone[];
             getBone(boneIndex: number): MdlBone;
             getBoneByName(boneName: string): MdlBone;
             getBoneId(boneName: string): any;
             getAttachments(): MdlAttachement[];
             getAttachementsNames(out?: Array<string>): string[];
             getAttachementById(attachementId: any): MdlAttachement;
             getAttachement(attachementName: any): any;
             getSequenceById(sequenceId: any): MdlStudioSeqDesc;
             getSequencesList(): any[];
             getSequencesList2(): any[];
             getSequences(): string[];
             getSequences2(): any[];
             getAnimDescription(animIndex: any): any;
             getAnimFrame(dynamicProp: any, animDesc: any, frameIndex: any): any;
             getLocalPoseParameter(poseIndex: any): any;
             getPoseParameters(): any[];
             getAllPoseParameters(): any;
             boneFlags(boneIndex: number): number;
         }

         export declare class SourceModel {
             repository: string;
             fileName: string;
             name: string;
             mdl: SourceMDL;
             vvd: any;
             vtx: any;
             requiredLod: number;
             drawBodyPart: {};
             currentSkin: number;
             currentSheen: any;
             animLayers: any[];
             materialRepository: any;
             dirty: boolean;
             bodyParts: Map<string, SourceModelMesh[][]>;
             constructor(repository: any, fileName: any, mdl: any, vvd: any, vtx: any);
             addGeometry(mesh: any, geometry: any, bodyPartName: any, bodyPartModelId: any): void;
             createInstance(isDynamic: any, preventInit: any): Source1ModelInstance;
             getBodyNumber(bodygroups: Map<string, number>): number;
             getBones(): MdlBone[];
             getAttachments(): MdlAttachement[];
             getBone(boneIndex: any): MdlBone;
             getAttachementById(attachementIndex: any): MdlAttachement;
             getBoneByName(boneName: any): MdlBone;
             getAttachement(attachementName: any): any;
             getBodyPart(bodyPartId: any): MdlBodyPart;
             getBodyParts(): MdlBodyPart[];
             getAnimation(animationName: string, entity: Source1ModelInstance): Promise<Animation_2>;
         }

         declare class SourceModelMesh {
             mesh: any;
             geometry: any;
             constructor(mesh: any, geometry: any);
         }

         declare class SourcePCF {
             repository: string;
             stringDict: any[];
             elementsDict: any[];
             systems: {};
             systems2: {};
             binaryVersion: any;
             repositoryName: string;
             constructor(repository: string);
             getSystemElement(systemName: any): any;
             addSystem(element: any): void;
             getSystem(systemName: any): SourceEngineParticleSystem;
             initSystem(system: any): any;
             addOperators(system: any, list: any, listType: any): void;
             addAttributes(operator: any, list: any): void;
         }

         /**
          * VTX Model
          */
         declare class SourceVTX {
             bodyparts: any[];
             getBodyparts(): any[];
         }

         /**
          * VVD Model
          */
         declare class SourceVVD {
             vertices: any;
             numFixups: any;
             fixups: any;
             getVertices(lodLevel: any): any;
         }

         export declare class Sphere extends Mesh {
             radius: number;
             segments: number;
             rings: number;
             phiStart: number;
             phiLength: number;
             thetaStart: number;
             thetaLength: number;
             isSphere: boolean;
             constructor(params?: any);
             updateGeometry(): void;
             buildContextMenu(): {
                 visibility: {
                     i18n: string;
                     selected: boolean;
                     f: () => void;
                 };
                 remove: {
                     i18n: string;
                     f: () => void;
                 };
                 destroy: {
                     i18n: string;
                     f: () => void;
                 };
                 remove_more: {
                     i18n: string;
                     submenu: {
                         i18n: string;
                         f: () => void;
                     }[];
                 };
                 name: {
                     i18n: string;
                     f: () => void;
                 };
                 add: {
                     i18n: string;
                     submenu: any;
                 };
                 entitynull_1: any;
                 position: {
                     i18n: string;
                     f: () => void;
                 };
                 translate: {
                     i18n: string;
                     f: () => void;
                 };
                 reset_position: {
                     i18n: string;
                     f: () => vec3;
                 };
                 entitynull_2: any;
                 quaternion: {
                     i18n: string;
                     f: () => void;
                 };
                 rotate: {
                     i18n: string;
                     submenu: {
                         i18n: string;
                         f: () => void;
                     }[];
                 };
                 reset_rotation: {
                     i18n: string;
                     f: () => quat;
                 };
                 entitynull_3: any;
                 scale: {
                     i18n: string;
                     f: () => void;
                 };
                 reset_scale: {
                     i18n: string;
                     f: () => vec3;
                 };
                 entitynull_4: any;
                 wireframe: {
                     i18n: string;
                     selected: boolean;
                     f: () => void;
                 };
                 cast_shadows: {
                     i18n: string;
                     selected: boolean;
                     f: () => void;
                 };
                 receive_shadows: {
                     i18n: string;
                     selected: boolean;
                     f: () => void;
                 };
                 material: {
                     i18n: string;
                     submenu: {};
                 };
             } & {
                 Sphere_1: any;
                 radius: {
                     i18n: string;
                     f: () => void;
                 };
                 segments: {
                     i18n: string;
                     f: () => void;
                 };
                 rings: {
                     i18n: string;
                     f: () => void;
                 };
             };
             raycast(raycaster: any, intersections: any): void;
             toJSON(): any;
             static constructFromJSON(json: any, entities: any, loadedPromise: any): Promise<Sphere>;
             static getEntityName(): string;
         }

         export declare class Spin extends Operator {
             spinRateDegrees: number;
             spinRateMinDegrees: number;
             spinRateStopTime: number;
             _paramChanged(paramName: any, value: any): void;
             doOperate(particle: any, elapsedTime: any): void;
         }

         export declare class SpinUpdate extends Operator {
             doOperate(particle: any, elapsedTime: any): void;
         }

         export declare class SpotLight extends Light {
             #private;
             isSpotLight: boolean;
             innerAngleCos: number;
             outerAngleCos: number;
             constructor(parameters?: {});
             set castShadow(castShadow: boolean | undefined);
             get castShadow(): boolean | undefined;
             set angle(angle: number);
             get angle(): number;
             set innerAngle(innerAngle: number);
             get innerAngle(): number;
             getDirection(out?: vec3): vec3;
             buildContextMenu(): {
                 visibility: {
                     i18n: string;
                     selected: boolean;
                     f: () => void;
                 };
                 remove: {
                     i18n: string;
                     f: () => void;
                 };
                 destroy: {
                     i18n: string;
                     f: () => void;
                 };
                 remove_more: {
                     i18n: string;
                     submenu: {
                         i18n: string;
                         f: () => void;
                     }[];
                 };
                 name: {
                     i18n: string;
                     f: () => void;
                 };
                 add: {
                     i18n: string;
                     submenu: any;
                 };
                 entitynull_1: any;
                 position: {
                     i18n: string;
                     f: () => void;
                 };
                 translate: {
                     i18n: string;
                     f: () => void;
                 };
                 reset_position: {
                     i18n: string;
                     f: () => vec3;
                 };
                 entitynull_2: any;
                 quaternion: {
                     i18n: string;
                     f: () => void;
                 };
                 rotate: {
                     i18n: string;
                     submenu: {
                         i18n: string;
                         f: () => void;
                     }[];
                 };
                 reset_rotation: {
                     i18n: string;
                     f: () => quat;
                 };
                 entitynull_3: any;
                 scale: {
                     i18n: string;
                     f: () => void;
                 };
                 reset_scale: {
                     i18n: string;
                     f: () => vec3;
                 };
                 entitynull_4: any;
                 wireframe: {
                     i18n: string;
                     selected: boolean;
                     f: () => void;
                 };
                 cast_shadows: {
                     i18n: string;
                     selected: boolean;
                     f: () => void;
                 };
                 receive_shadows: {
                     i18n: string;
                     selected: boolean;
                     f: () => void;
                 };
                 material: {
                     i18n: string;
                     submenu: {};
                 };
             } & {
                 Light_1: any;
                 color: {
                     i18n: string;
                     f: () => void;
                 };
                 intensity: {
                     i18n: string;
                     f: () => void;
                 };
             } & {
                 texture_size: {
                     i18n: string;
                     f: () => void;
                 };
             } & {
                 angle: {
                     i18n: string;
                     f: () => void;
                 };
                 inner_angle: {
                     i18n: string;
                     f: () => void;
                 };
                 range: {
                     i18n: string;
                     f: () => void;
                 };
             };
             static getEntityName(): string;
         }

         export declare class SpotLightHelper extends Mesh {
             #private;
             constructor();
             update(): void;
             parentChanged(parent?: Entity | null): void;
         }

         export declare class SpriteCardMaterial extends SourceEngineMaterial {
             constructor(params?: any);
             clone(): SpriteCardMaterial;
             get shaderSource(): string;
         }

         export declare class SpriteMaterial extends SourceEngineMaterial {
             constructor(params?: any);
             clone(): SpriteMaterial;
             get shaderSource(): string;
         }

         /**
          * SpyInvis proxy.
          * @comment ouput variable name: resultVar
          */
         export declare class SpyInvis extends Proxy_2 {
         }

         /**
          * StatTrakDigit Proxy
          */
         export declare class StatTrakDigit extends Proxy_2 {
             #private;
             init(): void;
             execute(variables: any, proxyParams: any, time: any): void;
         }

         export declare class StatTrakIllum extends Proxy_2 {
             #private;
             init(): void;
             execute(variables: any, proxyParams: any): void;
         }

         export declare class StickybombGlowColor extends Proxy_2 {
             #private;
             init(): void;
             execute(variables: any, proxyParams: any): void;
         }

         export declare function stringToQuat(s: string, q?: quat): quat;

         export declare function stringToVec3(s: string, v?: vec3): vec3;

         export declare class Target extends Entity {
             static constructFromJSON(json: any): Promise<Target>;
             static getEntityName(): string;
         }

         export declare const TAU: number;

         export declare class Text3D extends Mesh {
             #private;
             isText3D: boolean;
             static defaultFont: string;
             static defaultStyle: string;
             constructor(params?: any);
             set text(text: string);
             set size(size: number);
             set depth(depth: number);
             set font(font: string);
             set style(style: string);
             toJSON(): any;
             static constructFromJSON(json: any): Promise<Text3D>;
             fromJSON(json: any): void;
             buildContextMenu(): {
                 visibility: {
                     i18n: string;
                     selected: boolean;
                     f: () => void;
                 };
                 remove: {
                     i18n: string;
                     f: () => void;
                 };
                 destroy: {
                     i18n: string;
                     f: () => void;
                 };
                 remove_more: {
                     i18n: string;
                     submenu: {
                         i18n: string;
                         f: () => void;
                     }[];
                 };
                 name: {
                     i18n: string;
                     f: () => void;
                 };
                 add: {
                     i18n: string;
                     submenu: any;
                 };
                 entitynull_1: any;
                 position: {
                     i18n: string;
                     f: () => void;
                 };
                 translate: {
                     i18n: string;
                     f: () => void;
                 };
                 reset_position: {
                     i18n: string;
                     f: () => vec3;
                 };
                 entitynull_2: any;
                 quaternion: {
                     i18n: string;
                     f: () => void;
                 };
                 rotate: {
                     i18n: string;
                     submenu: {
                         i18n: string;
                         f: () => void;
                     }[];
                 };
                 reset_rotation: {
                     i18n: string;
                     f: () => quat;
                 };
                 entitynull_3: any;
                 scale: {
                     i18n: string;
                     f: () => void;
                 };
                 reset_scale: {
                     i18n: string;
                     f: () => vec3;
                 };
                 entitynull_4: any;
                 wireframe: {
                     i18n: string;
                     selected: boolean;
                     f: () => void;
                 };
                 cast_shadows: {
                     i18n: string;
                     selected: boolean;
                     f: () => void;
                 };
                 receive_shadows: {
                     i18n: string;
                     selected: boolean;
                     f: () => void;
                 };
                 material: {
                     i18n: string;
                     submenu: {};
                 };
             } & {
                 Text3D_1: any;
                 text: {
                     i18n: string;
                     f: () => void;
                 };
                 font: {
                     i18n: string;
                     f: () => Promise<void>;
                 };
                 font_size: {
                     i18n: string;
                     f: () => void;
                 };
                 font_depth: {
                     i18n: string;
                     f: () => void;
                 };
             };
             static getEntityName(): string;
         }

         export declare class Texture {
             #private;
             mapping: TextureMapping;
             image?: HTMLImageElement;
             internalFormat: any;
             format: any;
             type: any;
             magFilter: any;
             minFilter: any;
             wrapS: any;
             wrapT: any;
             anisotropy: number;
             generateMipmaps: boolean;
             flipY: boolean;
             premultiplyAlpha: boolean;
             dirty: boolean;
             texture: WebGLTexture | null;
             width: number;
             height: number;
             isTexture: boolean;
             name: string;
             isRenderTargetTexture: boolean;
             properties: Map<string, any>;
             constructor(textureParams?: TextureParams);
             setParameters(glContext: WebGLAnyRenderingContext, target: GLenum): void;
             texImage2D(glContext: WebGLAnyRenderingContext, target: TextureTarget, width: number, height: number, format: TextureFormat, type: TextureType, pixels?: ArrayBufferView | null, level?: number): void;
             generateMipmap(glContext: WebGLAnyRenderingContext, target: GLenum): void;
             clone(): void;
             copy(other: Texture): void;
             setAlphaBits(bits: number): void;
             getAlphaBits(): number;
             hasAlphaChannel(): boolean;
             getWidth(): number;
             getHeight(): number;
             is(type: string): boolean;
             addUser(user: any): void;
             removeUser(user: any): void;
             hasNoUser(): boolean;
             hasOnlyUser(user: any): boolean;
             dispose(): void;
         }

         export declare const TEXTURE_FORMAT_COMPRESSED_BPTC: number;

         export declare const TEXTURE_FORMAT_COMPRESSED_RGB_DXT1: number;

         export declare const TEXTURE_FORMAT_COMPRESSED_RGBA_BC4: number;

         export declare const TEXTURE_FORMAT_COMPRESSED_RGBA_BC5: number;

         export declare const TEXTURE_FORMAT_COMPRESSED_RGBA_BC7: number;

         export declare const TEXTURE_FORMAT_COMPRESSED_RGBA_DXT1: number;

         export declare const TEXTURE_FORMAT_COMPRESSED_RGBA_DXT3: number;

         export declare const TEXTURE_FORMAT_COMPRESSED_RGBA_DXT5: number;

         export declare const TEXTURE_FORMAT_COMPRESSED_RGTC: number;

         export declare const TEXTURE_FORMAT_COMPRESSED_S3TC: number;

         export declare const TEXTURE_FORMAT_UNCOMPRESSED: number;

         export declare const TEXTURE_FORMAT_UNCOMPRESSED_BGRA8888: number;

         export declare const TEXTURE_FORMAT_UNCOMPRESSED_R8: number;

         export declare const TEXTURE_FORMAT_UNCOMPRESSED_RGB: number;

         export declare const TEXTURE_FORMAT_UNCOMPRESSED_RGBA: number;

         export declare const TEXTURE_FORMAT_UNKNOWN = 0;

         export declare const TextureFactoryEventTarget: EventTarget;

         export declare enum TextureFormat {
             Rgb = 6407,
             Rgba = 6408,
             Luminance = 6409,
             LuminanceAlpha = 6410,
             Alpha = 6406,
             R8 = 33321,
             R8SignedNormalized = 33321,
             Rgba_32F = 34836,
             Rgb_32F = 34837,
             Rgba_16F = 34842,
             Rgba_32UI = 36208
         }

         export declare class TextureLookup extends Node_2 {
             #private;
             inputTexture?: Texture;
             constructor(editor: NodeImageEditor, params?: any);
             operate(context?: any): Promise<void>;
             get title(): string;
             toString(tabs?: string): Promise<string>;
             dispose(): void;
         }

         export declare class TextureManager {
             #private;
             static setTexture(path: string, texture: Texture): void;
             static createTexture(textureParams?: TextureParams): Texture;
             static deleteTexture(texture: Texture): void;
             static createFlatTexture(color?: number[], needCubeMap?: boolean): Texture;
             static createCheckerTexture(color?: number[], width?: number, height?: number, needCubeMap?: boolean): Texture;
             static createNoiseTexture(width: number, height: number, needCubeMap?: boolean): Texture;
             static createTextureFromImage(image: HTMLImageElement, textureParams?: TextureParams): Texture;
             static fillTextureWithImage(texture: Texture, image: HTMLImageElement): void;
         }

         export declare enum TextureMapping {
             UvMapping = 0,
             CubeMapping = 1,
             CubeUvMapping = 2
         }

         declare type TextureParams = any;

         export declare class TextureScroll extends Proxy_2 {
             #private;
             init(variables: any): void;
             execute(variables: any, proxyParams: any, time: any): void;
         }

         export declare enum TextureTarget {
             TEXTURE_2D = 3553,
             TEXTURE_CUBE_MAP_POSITIVE_X = 34069,
             TEXTURE_CUBE_MAP_NEGATIVE_X = 34070,
             TEXTURE_CUBE_MAP_POSITIVE_Y = 34071,
             TEXTURE_CUBE_MAP_NEGATIVE_Y = 34072,
             TEXTURE_CUBE_MAP_POSITIVE_Z = 34073,
             TEXTURE_CUBE_MAP_NEGATIVE_Z = 34074
         }

         export declare class TextureTransform extends Proxy_2 {
             centerVar: any;
             translateVar: any;
             rotateVar: any;
             scaleVar: any;
             resultVar: any;
             init(variables: any): void;
             execute(variables: any, proxyParams: any, time: any): void;
         }

         export declare enum TextureType {
             UnsignedByte = 5121,
             UnsignedShort_5_6_5 = 33635,
             UnsignedShort_4_4_4_4 = 32819,
             UnsignedShort_5_5_5_1 = 32820,
             UnsignedShort = 5123,
             UnsignedInt = 5125,
             UnsignedInt_24_8 = 34042,
             Float = 5126,
             HalfFloatOes = 36193,
             HalfFloat = 5131,
             Byte = 5120,
             Short = 5122,
             Int = 5124,
             UnsignedInt_2_10_10_10 = 33640,
             UnsignedInt_10F_11F_11F = 35899,
             UnsignedInt_5_9_9_9 = 35902,
             UnsignedFloat_32_UnsignedInt_24_8 = 36269
         }

         export declare class Timeline extends TimelineElement {
             #private;
             type: TimelineElementType.Timeline;
             name: string;
             constructor(name?: string);
             setParent(element: TimelineElement): void;
             getRoot(): TimelineGroup;
             addChild(child: TimelineElement): TimelineElement;
             getChilds(): TimelineElement[];
         }

         export declare class TimelineChannel extends TimelineElement {
             #private;
             type: TimelineElementType.Channel;
             constructor(name?: string);
             addClip(clip: TimelineClip): TimelineClip;
             getClips(): TimelineClip[];
         }

         export declare class TimelineClip extends TimelineElement {
             type: TimelineElementType.Clip;
             constructor(name?: string, startTime?: number, endTime?: number);
             setStartTime(start: number): void;
             getStartTime(): number;
             setEndTime(end: number): void;
             getEndTime(): number;
             getLength(): number;
         }

         export declare class TimelineElement {
             #private;
             type: TimelineElementType;
             constructor(name: string);
             setName(name: string): void;
             getName(): string;
             addProperty(name: string, type: TimelinePropertyType, value: any): TimelineProperty;
             setPropertyValue(name: string, value: any): void;
             getPropertyValue(name: string): any;
         }

         export declare enum TimelineElementType {
             None = 0,
             Timeline = 1,
             Group = 2,
             Channel = 3,
             Clip = 4,
             Marker = 5
         }

         export declare class TimelineGroup extends TimelineElement {
             #private;
             type: TimelineElementType.Group;
             addChild(child: TimelineElement): TimelineElement;
             getChilds(): TimelineElement[];
         }

         declare class TimelineProperty {
             #private;
             constructor(name: string, type: TimelinePropertyType, value: any);
             setValue(value: any): void;
             getValue(): any;
         }

         declare enum TimelinePropertyType {
             Unknown = 0,
             Int = 1,
             Float = 2,
             Time = 3,
             String = 4,
             Bool = 5,
             Color = 6
         }

         export declare enum ToneMapping {
             None = 0,
             Linear = 1,
             Reinhard = 2,
             ReinhardExtended = 3
         }

         export declare class TrailLengthRandom extends SourceEngineParticleOperator {
             static functionName: string;
             constructor();
             doInit(particle: any, elapsedTime: any): void;
         }

         export declare class TranslationControl extends Entity {
             #private;
             constructor(params?: any);
             buildContextMenu(): {
                 visibility: {
                     i18n: string;
                     selected: boolean;
                     f: () => void;
                 };
                 remove: {
                     i18n: string;
                     f: () => void;
                 };
                 destroy: {
                     i18n: string;
                     f: () => void;
                 };
                 remove_more: {
                     i18n: string;
                     submenu: {
                         i18n: string;
                         f: () => void;
                     }[];
                 };
                 name: {
                     i18n: string;
                     f: () => void;
                 };
                 add: {
                     i18n: string;
                     submenu: any;
                 };
                 entitynull_1: any;
                 position: {
                     i18n: string;
                     f: () => void;
                 };
                 translate: {
                     i18n: string;
                     f: () => void;
                 };
                 reset_position: {
                     i18n: string;
                     f: () => vec3;
                 };
                 entitynull_2: any;
                 quaternion: {
                     i18n: string;
                     f: () => void;
                 };
                 rotate: {
                     i18n: string;
                     submenu: {
                         i18n: string;
                         f: () => void;
                     }[];
                 };
                 reset_rotation: {
                     i18n: string;
                     f: () => quat;
                 };
                 entitynull_3: any;
                 scale: {
                     i18n: string;
                     f: () => void;
                 };
                 reset_scale: {
                     i18n: string;
                     f: () => vec3;
                 };
                 entitynull_4: any;
                 wireframe: {
                     i18n: string;
                     selected: boolean;
                     f: () => void;
                 };
                 cast_shadows: {
                     i18n: string;
                     selected: boolean;
                     f: () => void;
                 };
                 receive_shadows: {
                     i18n: string;
                     selected: boolean;
                     f: () => void;
                 };
                 material: {
                     i18n: string;
                     submenu: {};
                 };
             } & {
                 TranslationControl_1: any;
                 speed: {
                     i18n: string;
                     f: () => void;
                 };
                 start_position: {
                     i18n: string;
                     f: () => void;
                 };
                 end_position: {
                     i18n: string;
                     f: () => void;
                 };
             };
         }

         export declare class TRIANGLE {
             p: Array<vec3>;
         }

         export declare class Triangles extends Mesh {
             #private;
             constructor(params?: any);
             updateGeometry(): void;
         }

         export declare class TwistAroundAxis extends SourceEngineParticleOperator {
             static functionName: string;
             constructor();
             doForce(particle: any, elapsedTime: any, accumulatedForces: any, strength?: number): void;
         }

         export declare const TWO_PI: number;

         declare const TypedArrayProto: any;

         export declare class Uint16BufferAttribute extends BufferAttribute {
             constructor(array: typeof TypedArrayProto, itemSize: number, offset?: number, length?: number);
         }

         export declare class Uint32BufferAttribute extends BufferAttribute {
             constructor(array: typeof TypedArrayProto, itemSize: number, offset?: number, length?: number);
         }

         export declare class Uint8BufferAttribute extends BufferAttribute {
             constructor(array: typeof TypedArrayProto, itemSize: number, offset?: number, length?: number);
         }

         declare class Uniform {
             #private;
             setValue: (context: WebGLAnyRenderingContext, value: any) => void;
             constructor(activeInfo: WebGLActiveInfo, uniformLocation: WebGLUniformLocation);
             setTextureUnit(textureUnit: number): void;
             isTextureSampler(): boolean;
             getSize(): number;
         }

         export declare class UniformNoiseProxy extends Proxy_2 {
             execute(variables: any): void;
         }

         export declare class UnlitGenericMaterial extends SourceEngineMaterial {
             diffuseModulation: vec4;
             constructor(params?: any);
             clone(): UnlitGenericMaterial;
             get shaderSource(): string;
         }

         export declare class UnlitTwoTextureMaterial extends SourceEngineMaterial {
             constructor(params?: any);
             clone(): UnlitTwoTextureMaterial;
             get shaderSource(): string;
             afterProcessProxies(): void;
         }

         /**
          * Clamp each component of vec3 to scalar values
          *
          * @param {vec3} out the receiving vector
          * @param {vec3} a vector to clamp
          * @param {Number} min Min value
          * @param {Number} max Max value
          * @returns {vec3} out
          */
         export declare function vec3ClampScalar(out: vec3, a: vec3, min: number, max: number): vec3;

         /**
          * Computes the mid point of two vectors
          *
          * @param {vec3} out the receiving vector
          * @param {vec3} a the first operand
          * @param {vec3} b the second operand
          * @returns {vec3} out
          */
         export declare function Vec3Middle(out: vec3, a: vec3, b: vec3): vec3;

         /**
          * Generates a random vector within two given vectors
          *
          * @param {vec3} out the receiving vector
          * @param {vec3} a the first operand
          * @param {vec3} a the second operand
          * @returns {vec3} out
          */
         export declare function vec3RandomBox(out: vec3, a: vec3, b: vec3): vec3;

         export declare class VectorNoise extends Operator {
             #private;
             fieldOutput: number;
             noiseScale: number;
             additive: boolean;
             offset: boolean;
             noiseAnimationTimeScale: number;
             valueScale: vec3;
             valueBase: vec3;
             constructor(system: Source2ParticleSystem);
             _paramChanged(paramName: any, value: any): void;
             doOperate(particle: any, elapsedTime: any): void;
         }

         export declare class VelocityNoise extends SourceEngineParticleOperator {
             static functionName: string;
             randX: number;
             randY: number;
             randZ: number;
             constructor();
             doInit(particle: any, elapsedTime: any): void;
             initMultipleOverride(): boolean;
         }

         export declare class VelocityRandom extends SourceEngineParticleOperator {
             static functionName: string;
             constructor();
             doInit(particle: any, elapsedTime: any): void;
             initMultipleOverride(): boolean;
         }

         export declare class VertexLitGenericMaterial extends SourceEngineMaterial {
             diffuseModulation: vec4;
             constructor(params?: any);
             afterProcessProxies(proxyParams: any): void;
             clone(): VertexLitGenericMaterial;
             get shaderSource(): string;
         }

         export declare class VpkRepository implements Repository {
             #private;
             constructor(name: string, files: Array<File>);
             get name(): string;
             getFile(filename: string): Promise<RepositoryArrayBufferResponse>;
             getFileAsText(filename: string): Promise<RepositoryTextResponse>;
             getFileAsBlob(filename: string): Promise<RepositoryBlobResponse>;
             getFileAsJson(filename: string): Promise<RepositoryJsonResponse>;
             getFileList(filter?: RepositoryFilter): Promise<RepositoryFileListResponse>;
         }

         export declare class WaterLod extends Proxy_2 {
         }

         export declare class WaterMaterial extends SourceEngineMaterial {
             constructor(params?: any);
             clone(): WaterMaterial;
             getShaderSource(): string;
         }

         export declare class WeaponDecalMaterial extends SourceEngineMaterial {
             constructor(params?: any);
             afterProcessProxies(proxyParams: any): void;
             set style(style: any);
             setColorUniform(uniformName: any, value: any): void;
             set color0(color: any);
             set color1(color: any);
             set color2(color: any);
             set color3(color: any);
             setPatternTexCoordTransform(scale: any, translation: any, rotation: any): void;
             getTexCoordTransform(scale: any, translation: any, rotation: any): mat4;
             getDefaultParameters(): {
                 $grungetexture: (string | number)[];
                 $weartexture: (string | number)[];
                 $decalstyle: number[];
                 $colortint: (number | number[])[];
                 $colortint2: (number | number[])[];
                 $colortint3: (number | number[])[];
                 $colortint4: (number | number[])[];
                 $unwearstrength: number[];
                 $wearremapmin: number[];
                 $wearremapmid: number[];
                 $wearremapmax: number[];
                 $wearwidthmin: number[];
                 $wearwidthmax: number[];
                 $wearbias: number[];
                 $desatbasetint: number[];
             };
             clone(): WeaponDecalMaterial;
             get shaderSource(): string;
         }

         export declare class WeaponInvis extends Proxy_2 {
         }

         export declare class WeaponLabelText extends Proxy_2 {
             #private;
             init(): void;
             execute(variables: any, proxyParams: any, time: any): void;
         }

         export declare class WeaponSkin extends Proxy_2 {
             #private;
             execute(variables: any, proxyParams: any): void;
         }

         declare type WebGLAnyRenderingContext = WebGLRenderingContext | WebGL2RenderingContext;

         export declare class WebGLRenderingState {
             #private;
             static setGraphics(graphics: Graphics): void;
             static clearColor(clearColor: vec4): void;
             static getClearColor(out?: vec4): vec4;
             static clearDepth(clearDepth: GLclampf): void;
             static clearStencil(clearStencil: GLint): void;
             static clear(color: boolean, depth: boolean, stencil: boolean): void;
             static colorMask(colorMask: vec4): void;
             static depthMask(flag: boolean): void;
             static stencilMask(stencilMask: GLuint): void;
             static lineWidth(width: GLfloat): void;
             static viewport(viewport: vec4): void;
             static scissor(scissor: vec4): void;
             static enable(cap: GLenum): void;
             static disable(cap: GLenum): void;
             static isEnabled(cap: GLenum): boolean;
             static useProgram(program: WebGLProgram): void;
             static enableVertexAttribArray(index: GLuint, divisor?: GLuint): void;
             static initUsedAttributes(): void;
             static disableUnusedAttributes(): void;
             static depthFunc(func: GLenum): void;
             static blendFunc(sourceFactor: GLenum, destinationFactor: GLenum): void;
             static blendFuncSeparate(srcRGB: GLenum, dstRGB: GLenum, srcAlpha: GLenum, dstAlpha: GLenum): void;
             static blendEquationSeparate(modeRGB: GLenum, modeAlpha: GLenum): void;
             static cullFace(mode: GLenum): void;
             static frontFace(mode: GLenum): void;
             static polygonOffset(enable: boolean, factor: GLfloat, units: GLfloat): void;
         }

         export declare class WebGLShaderSource {
             #private;
             static isWebGL2: boolean;
             constructor(type: ShaderType, source: string);
             setSource(source: string): this;
             isErroneous(): boolean;
             getSource(): string;
             getInclude(includeName: string, compileRow?: number, recursion?: Set<unknown>, allIncludes?: Set<unknown>): string[] | undefined | null;
             getCompileSource(includeCode?: string): string;
             getCompileSourceLineNumber(includeCode: string): string;
             setCompileError(error: string, includeCode?: string): void;
             getCompileError(convertRows?: boolean): any[];
             getIncludeAnnotations(): any[];
             compileRowToSourceRow(row: number): number;
             isValid(): boolean;
             reset(): void;
             containsInclude(includeName: string): boolean;
             getType(): ShaderType;
             getSourceRowToInclude(): Map<number, any>;
         }

         export declare class WebGLStats {
             #private;
             static start(): void;
             static beginRender(): void;
             static endRender(): void;
             static tick(): void;
             static drawElements(mode: GLenum, count: number): void;
             static get htmlElement(): HTMLElement;
             static getFps(): number;
         }

         export declare class WebRepository implements Repository {
             #private;
             constructor(name: string, base: string);
             get name(): string;
             get base(): string;
             getFile(fileName: string): Promise<RepositoryArrayBufferResponse>;
             getFileAsText(fileName: string): Promise<RepositoryTextResponse>;
             getFileAsBlob(fileName: string): Promise<RepositoryBlobResponse>;
             getFileAsJson(fileName: string): Promise<RepositoryJsonResponse>;
             getFileList(filter?: RepositoryFilter): Promise<RepositoryFileListResponse>;
         }

         export declare class Wireframe extends Entity {
             #private;
             enumerable: boolean;
             constructor(params?: any);
             setColor(color: vec4): void;
             parentChanged(parent: Entity | null): void;
             dispose(): void;
             is(s: string): boolean;
             static getEntityName(): string;
         }

         export declare class World extends Entity {
             parentChanged(parent: Entity | null): void;
             static getEntityName(): string;
             is(s: string): boolean;
         }

         export declare class WorldVertexTransitionMaterial extends SourceEngineMaterial {
             constructor(params?: any);
             afterProcessProxies(proxyParams: any): void;
             clone(): WorldVertexTransitionMaterial;
             getShaderSource(): string;
         }

         export declare class YellowLevel extends Proxy_2 {
             #private;
             init(): void;
             execute(variables: any, proxyParams: any): void;
         }

         export declare class ZipRepository implements Repository {
             #private;
             constructor(name: string, zip: File);
             get name(): string;
             getFile(filename: string): Promise<RepositoryArrayBufferResponse>;
             getFileAsText(filename: string): Promise<RepositoryTextResponse>;
             getFileAsBlob(filename: string): Promise<RepositoryBlobResponse>;
             getFileAsJson(filename: string): Promise<RepositoryJsonResponse>;
             getFileList(filter?: RepositoryFilter): Promise<RepositoryFileListResponse>;
         }

         export declare const Zstd: {
             "__#206@#webAssembly"?: any;
             "__#206@#HEAPU8"?: Uint8Array;
             decompress(compressedDatas: Uint8Array): Promise<Uint8Array<ArrayBuffer>>;
             decompress_ZSTD(compressedDatas: Uint8Array, uncompressedDatas: Uint8Array): Promise<any>;
             getWebAssembly(): Promise<any>;
             "__#206@#initHeap"(): void;
         };

         export { }
