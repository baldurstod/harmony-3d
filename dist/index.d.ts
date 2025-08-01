import { BinaryReader } from 'harmony-binary-reader';
import { HarmonyMenuItems } from 'harmony-ui';
import { mat2 } from 'gl-matrix';
import { mat3 } from 'gl-matrix';
import { mat4 } from 'gl-matrix';
import { quat } from 'gl-matrix';
import { Source2AnimeDecoder as Source2AnimeDecoder_2 } from '../models/source2animgroup';
import { Source2Particle as Source2Particle_2 } from '../../source2particle';
import { Texture as Texture_2 } from '../..';
import { Texture as Texture_3 } from '../../../../..';
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

export declare class AgeNoise extends Operator {
    #private;
    _paramChanged(paramName: string, param: OperatorParam): void;
    doInit(particle: Source2Particle, elapsedTime: number, strength: number): void;
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
    constructor(params?: AmbientLightParameters);
    static constructFromJSON(json: any): Promise<AmbientLight>;
    static getEntityName(): string;
    is(s: string): boolean;
}

declare type AmbientLightParameters = LightParameters;

declare interface Animated {
    hasAnimations: true;
    getAnimations: () => Promise<Set<string>>;
    playSequence: (name: string) => void;
    playAnimation: (name: string) => void;
    setAnimation: (id: number, name: string, weight: number) => void;
}

declare class AnimatedTexture extends Texture {
    frames: Texture[];
    addFrame(frame: number, texture: Texture): void;
    getFrame(frame: number): Texture;
    hasOnlyUser(user: any): boolean;
    dispose(): void;
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
    get name(): string;
    get frameCount(): number;
    set fps(fps: number);
    get fps(): number;
    get bones(): AnimationBone[];
    getFrame(id: number): AnimationFrame | undefined;
    setLooping(looping: boolean): void;
    isLooping(): boolean;
    toSMD(header?: string): string;
}

declare class AnimationBone {
    #private;
    refPosition: vec3;
    refQuaternion: quat;
    constructor(id: number, parentId: number, name: string, position: vec3, quaternion: quat);
    get id(): number;
    getParentId(): number;
    get name(): string;
}

declare class AnimationFrame {
    #private;
    constructor(frameId: number);
    setDatas(name: string, type: AnimationFrameDataType, datas: AnimationFrameDataTypes[]): void;
    pushData(name: string, data: AnimationFrameDataTypes): void;
    getData(name: string): AnimationFrameData | undefined;
    getFrameId(): number;
}

declare class AnimationFrameData {
    type: AnimationFrameDataType;
    datas: AnimationFrameDataTypes[];
    constructor(type: AnimationFrameDataType, datas?: AnimationFrameDataTypes[]);
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
    #private;
    _paramChanged(paramName: string, param: OperatorParam): void;
    doForce(particle: Source2Particle, elapsedTime: number, accumulatedForces: vec3, strength: number): void;
}

export declare const ATTRIBUTE_CHANGED = "attributechanged";

export declare type AttributeChangedEventData = PropertyChangedEventData;

export declare class AudioGroup {
    #private;
    name: string;
    groups: Map<string, AudioGroup>;
    audioList: Set<HTMLMediaElement>;
    constructor(name: string);
    mute(mute: boolean): void;
    isMute(): boolean;
    getGroup(groupPath: string[]): AudioGroup;
    createSubGroup(name: string): AudioGroup;
    playAudio(audio: HTMLMediaElement): Promise<void>;
}

export declare class AudioMixer {
    static master: AudioGroup;
    static muteGroup(groupName: string, mute?: boolean): void;
    static mute(mute?: boolean): void;
    static getGroup(groupName?: string): AudioGroup;
    static playAudio(groupName: string, audio: HTMLMediaElement): Promise<void>;
}

export declare class BackGround {
    render(renderer: Renderer, camera: Camera): void;
    dispose(): void;
    is(s: string): boolean;
}

export declare interface BaseProperties {
    color: vec4;
    radius: number;
    lifespan: number;
    sequenceNumber: number;
    snapshotControlPoint: number;
    snapshot: string;
    rotationSpeedRoll: number;
    controlPointConfigurations: ControlPointConfiguration[];
}

export declare class BasicMovement extends Operator {
    #private;
    _paramChanged(paramName: string, param: OperatorParam): void;
    doOperate(particle: Source2Particle, elapsedTime: number, strength: number): void;
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

export declare enum BlendingFactor {
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

declare interface BodyGroupChoice {
    choice: string;
    bodyGroup: string;
    bodyGroupId: number;
}

declare type BodyPart = BodyPartMesh[];

declare type BodyPartMesh = BufferGeometry[];

export declare class Bone extends Entity implements Lockable {
    #private;
    isBone: boolean;
    isLockable: true;
    dirty: boolean;
    lastComputed: number;
    tempPosition: vec3;
    tempQuaternion: quat;
    readonly _initialQuaternion: quat;
    readonly _initialPosition: vec3;
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
    setLocked(locked: boolean): void;
    isLocked(): boolean;
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
    readonly properties: Properties;
    getAttribute(name: string): BufferAttribute;
    setAttribute(name: string, attribute: BufferAttribute): void;
    hasAttribute(name: string): boolean;
    deleteAttribute(name: string): void;
    get elementArrayType(): number;
    setIndex(attribute: BufferAttribute): void;
    update(glContext: WebGLAnyRenderingContext): void;
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
    constructor(params?: CameraParameters);
    computeCameraMatrix(): void;
    reset(): void;
    setProjection(projection: CameraProjection): void;
    get projection(): CameraProjection;
    setProjectionMix(projectionMix: number): void;
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
    distanceFrom(point: vec3): number;
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
    invertProjection(v3: vec3): void;
    getViewDirection(v?: vec3): vec3;
    copy(source: Camera): void;
    toJSON(): any;
    static constructFromJSON(json: JSONObject): Promise<Camera>;
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

declare type CameraParameters = EntityParameters & {
    nearPlane?: number;
    farPlane?: number;
    orthoZoom?: number;
    projectionMix?: number;
    projection?: CameraProjection;
    verticalFov?: number;
    aspectRatio?: number;
    upVector?: vec3;
    left?: number;
    right?: number;
    top?: number;
    bottom?: number;
};

export declare enum CameraProjection {
    Perspective = 0,
    Orthographic = 1,
    Mixed = 2
}

export declare type CDmxAttribute = {
    typeName: string;
    type: CDmxAttributeType;
    value: CDmxAttributeValue | CDmxAttributeValue[];
};

export declare enum CDmxAttributeType {
    Unknown = 0,
    Element = 1,
    Integer = 2,
    Float = 3,
    Bool = 4,
    String = 5,
    Void = 6,
    Time = 7,
    Color = 8,//rgba
    Vec2 = 9,
    Vec3 = 10,
    Vec4 = 11,
    QAngle = 12,
    Quaternion = 13,
    VMatrix = 14,
    ElementArray = 15,
    IntegerArray = 16,
    FloatArray = 17,
    BoolArray = 18,
    StringArray = 19,
    VoidArray = 20,
    TimeArray = 21,
    ColorArray = 22,
    Vec2Array = 23,
    Vec3Array = 24,
    Vec4Array = 25,
    QAngleArray = 26,
    QuaternionArray = 27,
    VMatrixArray = 28
}

export declare type CDmxAttributeValue = null | undefined | boolean | number | CDmxElement | Color | vec2 | vec3 | vec4 | string;

export declare class CDmxElement {
    type: string;
    name: string;
    guid: Uint8Array;
    guid2: string;
    attributes: CDmxAttribute[];
    inlineSubElements(): Map<CDmxElement, boolean>;
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

export declare interface ChildAddedEventData {
    child: Entity;
    parent: Entity | null;
}

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

     export declare class ClampScalar extends Operator {
         #private;
         _paramChanged(paramName: string, param: OperatorParam): void;
         doOperate(particle: Source2Particle, elapsedTime: number, strength: number): void;
     }

     export declare class ClearPass extends Pass {
         #private;
         swapBuffers: boolean;
         constructor(clearColor: any, clearDepth: any, clearStencil: any);
         set clearColor(clearColor: vec4);
         set clearDepth(clearDepth: any);
         set clearStencil(clearStencil: any);
         render(renderer: Graphics, readBuffer: RenderTarget, writeBuffer: RenderTarget, renderToScreen: boolean, delta: number, context: RenderContext): void;
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
         #private;
         constructor(system: Source2ParticleSystem);
         _paramChanged(paramName: string, param: OperatorParam): void;
         doOperate(particle: Source2Particle, elapsedTime: number, strength: number): void;
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
         passes: Pass[];
         renderTarget1: RenderTarget;
         renderTarget2: RenderTarget;
         readBuffer: RenderTarget;
         writeBuffer: RenderTarget;
         constructor(renderTarget?: RenderTarget);
         render(delta: number, context: RenderContext): void;
         savePicture(filename: string, width: number, height: number): void;
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
         #private;
         _paramChanged(paramName: string, param: OperatorParam): void;
         applyConstraint(particle: Source2Particle): void;
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
         observe(subject: EventTarget, dependent: any): void;
         unobserve(subject: any, dependent: any): void;
     }

     export declare class ContinuousEmitter extends Emitter {
         #private;
         _paramChanged(paramName: string, param: OperatorParam): void;
         doEmit(elapsedTime: number): void;
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
         parentModel?: Entity;
         lastComputed: number;
         snapshot?: Source2Snapshot;
         model?: Source2ModelInstance;
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

     export declare type ControlPointConfiguration = {
         name: string;
         drivers: ControlPointConfigurationDriver[];
     };

     export declare type ControlPointConfigurationDriver = {
         attachmentName: string | null;
         entityName: string | null;
         attachType: string | null;
         controlPoint: number | null;
     };

     export declare class CopyPass extends Pass {
         constructor(camera: Camera);
         render(renderer: Graphics, readBuffer: RenderTarget, writeBuffer: RenderTarget, renderToScreen: boolean, delta: number, context: RenderContext): void;
     }

     export declare const CParticleSystemDefinition = "CParticleSystemDefinition";

     export declare class CPVelocityForce extends Operator {
         _paramChanged(paramName: string, param: OperatorParam): void;
         doForce(particle: Source2Particle, elapsedTime: number, accumulatedForces: vec3, strength: number): void;
     }

     export declare class CreateFromParentParticles extends Operator {
         #private;
         _paramChanged(paramName: string, param: OperatorParam): void;
         doInit(particle: Source2Particle, elapsedTime: number, strength: number): void;
     }

     export declare class CreateOnModel extends Operator {
         #private;
         _paramChanged(paramName: string, param: OperatorParam): void;
         doInit(particle: Source2Particle, elapsedTime: number, strength: number): void;
     }

     export declare class CreateOnModelAtHeight extends Operator {
         #private;
         _paramChanged(paramName: string, param: OperatorParam): void;
         doInit(particle: Source2Particle, elapsedTime: number, strength: number): void;
     }

     export declare class CreateSequentialPath extends Operator {
         #private;
         _paramChanged(paramName: string, param: OperatorParam): void;
         doInit(particle: Source2Particle, elapsedTime: number, strength: number): void;
     }

     export declare function createTexture(): WebGLTexture | null;

     export declare class CreateWithinBox extends Operator {
         #private;
         _paramChanged(paramName: string, param: OperatorParam): void;
         doInit(particle: Source2Particle, elapsedTime: number): void;
     }

     export declare class CreateWithinSphere extends Operator {
         #private;
         _paramChanged(paramName: string, param: OperatorParam): void;
         doInit(particle: Source2Particle, elapsedTime: number, strength: number): void;
     }

     export declare class CreationNoise extends Operator {
         #private;
         _paramChanged(paramName: string, param: OperatorParam): void;
         doInit(particle: Source2Particle, elapsedTime: number, strength: number): void;
     }

     export declare class CrosshatchPass extends Pass {
         constructor(camera: any);
         render(renderer: Graphics, readBuffer: RenderTarget, writeBuffer: RenderTarget, renderToScreen: boolean, delta: number, context: RenderContext): void;
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
         setImages(images?: HTMLImageElement[]): void;
         getImages(): HTMLImageElement[] | undefined;
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
         #private;
         _paramChanged(paramName: string, param: OperatorParam): void;
         doOperate(particle: Source2Particle, elapsedTime: number, strength: number): void;
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

     export declare const DEFAULT_GROUP_ID = 0;

     export declare const DEFAULT_MAX_PARTICLES = 1000;

     export declare const DEFAULT_TEXTURE_SIZE = 512;

     export declare const DEG_TO_RAD: number;

     export declare function degToRad(deg: number): number;

     export declare function deleteTexture(texture: WebGLTexture | null): void;

     export declare class Detex {
         #private;
         static decode(format: number, width: number, height: number, input: Uint8Array, output: Uint8Array): Promise<void>;
         static decodeBC1(width: number, height: number, input: Uint8Array, output: Uint8Array): Promise<void>;
         static decodeBC2(width: number, height: number, input: Uint8Array, output: Uint8Array): Promise<void>;
         static decodeBC3(width: number, height: number, input: Uint8Array, output: Uint8Array): Promise<void>;
         static decodeBC4(width: number, height: number, input: Uint8Array, output: Uint8Array): Promise<void>;
         static decodeBC7(width: number, height: number, input: Uint8Array, output: Uint8Array): Promise<void>;
         static getWebAssembly(): Promise<any>;
     }

     export declare class DistanceCull extends Operator {
         #private;
         _paramChanged(paramName: string, param: OperatorParam): void;
         doOperate(particle: Source2Particle, elapsedTime: number, strength: number): void;
     }

     export declare class DistanceToCP extends Operator {
         #private;
         _paramChanged(paramName: string, param: OperatorParam): void;
         doOperate(particle: Source2Particle, elapsedTime: number, strength: number): void;
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

     export declare const DmeElement = "DmeElement";

     export declare const DmeParticleSystemDefinition = "DmeParticleSystemDefinition";

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

     declare class Emitter extends Operator {
         emitterIndex: number;
         emissionDuration: number;
         startTime: number;
         _paramChanged(paramName: string, param: OperatorParam): void;
         emitParticle(creationTime: number, elapsedTime: number): Source2Particle_2;
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
         materialsParams: MaterialParams;
         isRenderable: boolean;
         lockPos: boolean;
         lockRot: boolean;
         drawOutline: boolean;
         locked: boolean;
         lockPosition: boolean;
         lockRotation: boolean;
         lockScale: boolean;
         static editMaterial: (entity: Entity) => void;
         readonly properties: Properties;
         loadedPromise?: Promise<any>;
         constructor(params?: EntityParameters);
         setParameters(parameters?: EntityParameters): void;
         set name(name: string);
         get name(): string;
         setPosition(position: vec3): void;
         getPosition(position?: vec3): vec3;
         /**
          * @deprecated Please use `setPosition` instead.
          */
         set position(position: vec3);
         /**
          * @deprecated Please use `getPosition` instead.
          */
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
         setVisible(visible?: boolean | undefined): void;
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
         addChilds(...childs: Entity[]): void;
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
          getAllChilds(includeSelf: boolean): Set<Entity>;
          getBoundsModelSpace(min?: vec3, max?: vec3): void;
          getBoundingBox(boundingBox?: BoundingBox): BoundingBox;
          getParentModel(): Entity | undefined;
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
          raycast(raycaster: Raycaster, intersections: Intersection[]): void;
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
          getProperty(name: string): Property | undefined;
          setProperty(name: string, value: Property): void;
          setLayer(layer?: number): void;
          getLayer(): number | undefined;
          setMaterialParam(name: string, value: MaterialParam): void;
          toJSON(): any;
          static constructFromJSON(json: JSONObject, entities: Map<string, Entity | Material>, loadedPromise: Promise<void>): Promise<Entity>;
          createChild(entityName: string, parameters: any): Promise<Entity | Material>;
          fromJSON(json: JSONObject): void;
          static getEntityName(): string;
          is(s: string): boolean;
         }

         export declare const ENTITY_DELETED = "entitydeleted";

         export declare interface EntityDeletedEventData {
             entity: Entity;
         }

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

         declare interface EntityParameters {
             name?: string;
             parent?: Entity;
             position?: vec3;
             quaternion?: quat;
             scale?: vec3;
             hideInExplorer?: boolean;
             castShadow?: boolean;
             receiveShadow?: boolean;
             visible?: boolean;
         }

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

         export declare function exportToBinaryFBX(entity: Entity): Promise<ArrayBufferLike>;

         export declare class EyeRefractMaterial extends SourceEngineMaterial {
             #private;
             constructor(params?: any);
             init(): void;
             afterProcessProxies(): void;
             beforeRender(camera: Camera): void;
             clone(): EyeRefractMaterial;
             get shaderSource(): string;
         }

         export declare class FadeAndKill extends Operator {
             #private;
             _paramChanged(paramName: string, param: OperatorParam): void;
             doOperate(particle: Source2Particle, elapsedTime: number, strength: number): void;
         }

         export declare class FadeIn extends Operator {
             #private;
             constructor(system: Source2ParticleSystem);
             _paramChanged(paramName: string, param: OperatorParam): void;
             doOperate(particle: Source2Particle, elapsedTime: number, strength: number): void;
         }

         export declare class FadeInSimple extends Operator {
             #private;
             constructor(system: Source2ParticleSystem);
             _paramChanged(paramName: string, param: OperatorParam): void;
             doOperate(particle: Source2Particle, elapsedTime: number, strength: number): void;
         }

         export declare class FadeOut extends Operator {
             #private;
             constructor(system: Source2ParticleSystem);
             _paramChanged(paramName: string, param: OperatorParam): void;
             doOperate(particle: Source2Particle, elapsedTime: number, strength: number): void;
         }

         export declare class FadeOutSimple extends Operator {
             #private;
             fadeOutTime: number;
             startFadeOutTime: number;
             invFadeOutTime: number;
             constructor(system: Source2ParticleSystem);
             _paramChanged(paramName: string, param: OperatorParam): void;
             doOperate(particle: Source2Particle, elapsedTime: number, strength: number): void;
         }

         declare type FetchFunction = (resource: string | URL | Request, options?: RequestInit) => Promise<Response>;

         export declare function FileNameFromPath(path: string): string;

         declare interface FileSelectorFile {
             name: string;
             path?: string;
             root?: string;
             files?: FileSelectorFile[];
         }

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
             setupCamera(): void;
             handleEnabled(): void;
         }

         declare class FlexController {
             controllers: Record<string, {
                 i: number;
                 min: number;
                 max: number;
             }>;
             controllers2: {};
             controllerIndex: number;
             getController(name: any, min: any, max: any): number;
             getControllers(): Record<string, {
                 i: number;
                 min: number;
                 max: number;
             }>;
             getControllerValue(name: any): any;
             getControllerRealValue(name: any): number;
             setControllerValue(name: any, value: any): void;
             setAllValues(value: any): void;
             removeAllControllers(): void;
         }

         declare type FlexWeight = Record<string, number>;

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

         declare class Font {
             json: any;
             constructor(json: any);
             generateShapes(text: any, size?: number): any[];
             createPaths(text?: string, size?: number): any[];
             createPath(char: any, scale: any, offsetX: any, offsetY: any): {
                 offsetX: number;
                 path: ShapePath;
             };
         }

         export declare class FontManager {
             #private;
             static setFontsPath(url: URL): void;
             static getFont(name: string, style?: string): Promise<Font>;
             static getFontList(): Promise<Map<string, Set<string>>>;
         }

         declare class ForwardRenderer extends Renderer {
             #private;
             constructor(graphics: Graphics);
             applyMaterial(program: Program, material: Material): void;
             render(scene: Scene, camera: Camera, delta: number, context: RenderContext): void;
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

         export declare function getLoader(name: string): any | undefined;

         export declare function getRandomInt(max: any): number;

         export declare function getSceneExplorer(): SceneExplorer;

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
             render(renderer: Graphics, readBuffer: RenderTarget, writeBuffer: RenderTarget, renderToScreen: boolean, delta: number, context: RenderContext): void;
         }

         export declare interface GraphicKeyboardEventData {
             keyboardEvent: KeyboardEvent;
         }

         export declare interface GraphicMouseEventData {
             x: number;
             y: number;
             entity: Entity | null;
             mouseEvent: MouseEvent;
         }

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
             glContext: WebGLAnyRenderingContext;
             ANGLE_instanced_arrays: any;
             OES_texture_float_linear: any;
             dragging: boolean;
             constructor();
             initCanvas(contextAttributes?: GraphicsInitOptions): this;
             pickEntity(x: number, y: number): Entity;
             getDefinesAsString(material: Material): string;
             render(scene: Scene, camera: Camera, delta: number, context: RenderContext): void;
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
             setColorMask(mask: vec4): void;
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
             savePicture(scene: Scene, camera: Camera, filename: string, width: number, height: number, type?: string, quality?: number): void;
             savePictureAsFile(filename: string, type?: string, quality?: number): Promise<File>;
             toBlob(type?: string, quality?: number): Promise<Blob | null>;
             _savePicture(filename: string, type?: string, quality?: number): Promise<void>;
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
             tick(delta: number, time: number, speed: number): void;
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

         declare interface GraphicsInitOptions {
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
         }

         export declare interface GraphicTickEvent {
             delta: number;
             time: number;
             speed: number;
         }

         export declare interface GraphicTouchEventData {
             entity: Entity | null;
             touchEvent: TouchEvent;
         }

         export declare interface GraphicWheelEventData {
             x: number;
             y: number;
             entity: Entity | null;
             wheelEvent: WheelEvent;
         }

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
             p: vec3[];
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

         declare interface HasSkeleton {
             skeleton: Skeleton | null | undefined;
         }

         export declare class HeartbeatScale extends Proxy_2 {
             #private;
             setParams(datas: any): void;
             init(): void;
             execute(variables: any, proxyParams: any, time: any): void;
         }

         declare class Hitbox {
             name: string;
             boundingBoxMin: vec3;
             boundingBoxMax: vec3;
             parent: Bone;
             constructor(name: string, boundingBoxMin: vec3, boundingBoxMax: vec3, parent: Bone);
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

         export declare const Includes: Record<string, string>;

         export declare class InheritFromParentParticles extends Operator {
             #private;
             _paramChanged(paramName: string, param: OperatorParam): void;
             doInit(particle: Source2Particle, elapsedTime: number, strength: number): void;
         }

         export declare class InitFloat extends Operator {
             #private;
             constructor(system: Source2ParticleSystem);
             _paramChanged(paramName: string, param: OperatorParam): void;
             doInit(particle: Source2Particle, elapsedTime: number, strength: number): void;
         }

         export declare class InitFromCPSnapshot extends Operator {
             #private;
             _paramChanged(paramName: string, param: OperatorParam): void;
             doInit(particle: Source2Particle, elapsedTime: number, strength: number): void;
         }

         export declare class InitialVelocityNoise extends Operator {
             #private;
             _paramChanged(paramName: string, param: OperatorParam): void;
             doInit(particle: Source2Particle, elapsedTime: number, strength: number): void;
             initMultipleOverride(): boolean;
         }

         export declare function initRandomFloats(): void;

         export declare class InitSkinnedPositionFromCPSnapshot extends Operator {
             #private;
             _paramChanged(paramName: string, param: OperatorParam): void;
             doInit(particle: Source2Particle, elapsedTime: number, strength: number): void;
         }

         export declare class InitVec extends Operator {
             #private;
             _paramChanged(paramName: string, param: OperatorParam): void;
             doInit(particle: Source2Particle, elapsedTime: number, strength: number): void;
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
             _pixelArray?: Uint8Array<ArrayBuffer>;
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

         export declare class InstantaneousEmitter extends Emitter {
             #private;
             _paramChanged(paramName: string, param: OperatorParam): void;
             doEmit(elapsedTime: number): void;
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
             #private;
             constructor(system: Source2ParticleSystem);
             _update(): void;
             _paramChanged(paramName: string, param: OperatorParam): void;
             doOperate(particle: Source2Particle, elapsedTime: number, strength: number): void;
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

         declare type JSONValue = string | number | boolean | null | undefined | JSONValue[] | JSONObject;

         export declare class KeepOnlyLastChild extends Entity {
             addChild(child: Entity): Entity;
             static getEntityName(): string;
         }

         /**
          * Kv3Element
          */
         declare class Kv3Element {
             #private;
             isKv3Element: true;
             setProperty(property: string, value: Kv3Element | Kv3Value | null): void;
             getProperty(name: string): Kv3Element | Kv3Value | null | undefined;
             getProperties(): Map<string, Kv3Element | Kv3Value | null>;
             getValue(name: string): Kv3ValueType;
             getValueAsString(name: string): string | null;
             getValueAsStringArray(name: string): string[] | null;
             getValueAsResource(name: string): string | null;
             getValueAsResourceArray(name: string): string[] | null;
             getValueAsBool(name: string): boolean | null;
             getValueAsNumber(name: string): number | null;
             getValueAsNumberArray(name: string): number[] | null;
             getValueAsVec4(name: string, out: vec4): vec4 | null;
             getValueAsBigint(name: string): bigint | null;
             getValueAsBigintArray(name: string): bigint[] | null;
             getValueAsBlob(name: string): Uint8Array | null;
             getValueAsElement(name: string): Kv3Element | null;
             getValueAsElementArray(name: string): Kv3Element[] | null;
             getValueAsVectorArray(name: string): number[][] | null;
             getSubValue(path: string): Kv3Element | Kv3Value | null;
             getSubValueAsString(path: string): string | null;
             getSubValueAsUint8Array(path: string): Uint8Array | null;
             getSubValueAsNumber(path: string): number | null;
             getSubValueAsElement(path: string): Kv3Element | null;
             getSubValueAsStringArray(path: string): string[] | null;
             getSubValueAsNumberArray(path: string): number[] | null;
             getSubValueAsVec4(path: string, out: vec4): vec4 | null;
             getSubValueAsElementArray(path: string): Kv3Element[] | null;
             exportAsText(linePrefix: string): string;
         }

         /**
          * Kv3File
          */
         declare class Kv3File {
             isKv3File: true;
             root: null | Kv3Element;
             setRoot(root: Kv3Element): void;
             exportAsText(): string;
             getValue(path: string): Kv3Element | Kv3Value | null;
             getValueAsNumber(path: string): number | null;
             getValueAsStringArray(path: string): string[] | null;
             getValueAsElementArray(path: string): Kv3Element[] | null;
         }

         declare enum Kv3Type {
             Unknown = 0,
             Null = 1,
             Bool = 2,
             Int64 = 3,
             UnsignedInt64 = 4,
             Double = 5,
             String = 6,
             Blob = 7,
             Array = 8,
             Element = 9,
             TypedArray = 10,
             Int32 = 11,
             UnsignedInt32 = 12,
             True = 13,
             False = 14,
             IntZero = 15,
             IntOne = 16,
             DoubleZero = 17,
             DoubleOne = 18,
             Float = 19,
             Byte = 23,
             TypedArray2 = 24,
             TypedArray3 = 25,
             Resource = 134
         }

         declare class Kv3Value {
             #private;
             isKv3Value: true;
             constructor(type: Kv3Type, value: Kv3ValueType, subType?: Kv3Type);
             getType(): Kv3Type;
             getSubType(): Kv3Type;
             isBoolean(): boolean;
             isNumber(): boolean;
             isBigint(): boolean;
             isNumberArray(): boolean;
             isBigintArray(): boolean;
             isArray(): boolean;
             isVector(): boolean;
             getValue(): Kv3ValueType;
             exportAsText(linePrefix?: string): string;
         }

         declare type Kv3ValueType = Kv3ValueTypeAll | Kv3ValueTypeAll[];

         declare type Kv3ValueTypeAll = Kv3ValueTypePrimitives | Kv3ValueTypeArrays;

         declare type Kv3ValueTypeArrays = number[];

         declare type Kv3ValueTypePrimitives = null | boolean | bigint | number | string | Uint8Array | Float32Array | Kv3Element | Kv3Value;

         export declare function lerp(min: number, max: number, v: number): number;

         export declare class LerpEndCapScalar extends Operator {
             #private;
             _paramChanged(paramName: string, param: OperatorParam): void;
             doOperate(particle: Source2Particle, elapsedTime: number, strength: number): void;
         }

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
             constructor(parameters?: LightParameters);
             set color(color: vec3);
             get color(): vec3;
             set intensity(intensity: number);
             get intensity(): number;
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

         declare type LightParameters = EntityParameters & {
             color?: vec3;
             intensity?: number;
         };

         export declare class LightShadow {
             #private;
             light: Light;
             camera: Camera;
             shadowMatrix: mat4;
             viewPorts: vec4[];
             viewPortsLength: number;
             renderTarget: RenderTarget;
             constructor(light: Light, camera: Camera);
             set range(range: number);
             set textureSize(textureSize: number);
             get textureSize(): vec2;
             computeShadowMatrix(mapIndex: number): void;
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
             static constructFromJSON(json: JSONObject): Promise<LineMaterial>;
             fromJSON(json: JSONObject): void;
             static getEntityName(): string;
         }

         export declare class LineSegments extends Mesh {
             #private;
             constructor(params?: any);
             setSegments(positions: any, colors?: any): void;
         }

         export declare function loadAnimGroup(source2Model: Source2Model, repository: string, animGroupName: string): Promise<Source2AnimGroup>;

         declare interface Lockable {
             isLockable: true;
             setLocked: (locked: boolean) => void;
             isLocked: () => boolean;
         }

         export declare class LockToBone extends SourceEngineParticleOperator {
             static functionName: string;
             constructor();
             doOperate(particle: any, elapsedTime: any): void;
         }

         declare interface Loopable {
             isLoopable: true;
             setLooping: (looping: boolean) => void;
             getLooping: () => boolean;
         }

         export declare class LoopSubdivision {
             #private;
             constructor();
             subdivide(indices: any, vertices: any, subdivideCount?: number, tolerance?: number): Promise<{
                 indices: Uint32Array<ArrayBuffer>;
                 vertices: Float32Array<ArrayBuffer>;
             }>;
         }

         export declare class MaintainEmitter extends Emitter {
             #private;
             _paramChanged(paramName: string, param: OperatorParam): void;
             doEmit(elapsedTime: number): void;
         }

         export declare class MaintainSequentialPath extends Operator {
             #private;
             assignedSoFar: number;
             loop: boolean;
             bounceDirection: number;
             cpPairs: boolean;
             operateAllParticlesRemoveme: true;
             _paramChanged(paramName: string, param: OperatorParam): void;
             doOperate(particles: Source2Particle[], elapsedTime: number, strength: number): void;
         }

         export declare class ManifestRepository implements Repository {
             #private;
             active: boolean;
             constructor(base: Repository);
             get name(): string;
             getFile(filename: string): Promise<RepositoryFileResponse>;
             getFileAsArrayBuffer(filename: string): Promise<RepositoryArrayBufferResponse>;
             getFileAsText(filename: string): Promise<RepositoryTextResponse>;
             getFileAsBlob(filename: string): Promise<RepositoryBlobResponse>;
             getFileAsJson(filename: string): Promise<RepositoryJsonResponse>;
             getFileList(): Promise<RepositoryFileListResponse>;
             generateModelManifest(name?: string): Promise<RepositoryError | null>;
             generateParticlesManifest(filename?: string): Promise<RepositoryError | null>;
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
             readonly m_vecVelocity: vec3;
             m_flMoveDoneTime: number;
             m_flLocalTime: number;
             f: number;
             keys: Map<string, any>;
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
             uniforms: Record<string, UniformValue>;
             defines: Record<string, any>;
             parameters: any;
             depthTest: boolean;
             depthFunc: any;
             depthMask: boolean;
             colorMask: vec4;
             blend: boolean;
             srcRGB: BlendingFactor;
             dstRGB: BlendingFactor;
             srcAlpha: BlendingFactor;
             dstAlpha: BlendingFactor;
             modeRGB: any;
             modeAlpha: any;
             polygonOffset: boolean;
             polygonOffsetFactor: number;
             polygonOffsetUnits: number;
             _dirtyProgram: boolean;
             colorMap?: Texture;
             properties: Map<string, any>;
             static materialList: Record<string, typeof Material>;
             constructor(params?: MaterialParams_2);
             get transparent(): boolean;
             set renderLights(renderLights: boolean);
             get renderLights(): boolean;
             setDefine(define: string, value?: string): void;
             removeDefine(define: string): void;
             setValues(values: any): void;
             clone(): unknown;
             setTransparency(srcRGB: BlendingFactor, dstRGB: BlendingFactor, srcAlpha?: BlendingFactor, dstAlpha?: BlendingFactor): void;
             setBlending(mode: BlendingMode, premultipliedAlpha?: boolean): void;
             updateMaterial(time: number, mesh: Mesh): void;
             beforeRender(camera: Camera): void;
             /**
              * @deprecated Please use `renderFace` instead.
              */
             set culling(mode: number);
             renderFace(renderFace: RenderFace): void;
             getRenderFace(): RenderFace;
             setColorMode(colorMode: MaterialColorMode): void;
             getColorMode(): MaterialColorMode;
             /**
              * @deprecated Please use `setColorMode` instead.
              */
             set colorMode(colorMode: MaterialColorMode);
             /**
              * @deprecated Please use `getColorMode` instead.
              */
             get colorMode(): MaterialColorMode;
             setColor(color: vec4): void;
             set color(color: vec4);
             get color(): vec4;
             setMeshColor(color?: vec4): void;
             setTexture(uniformName: string, texture: Texture | null, shaderDefine?: string): void;
             setTextureArray(uniformName: string, textureArray: Texture[]): void;
             setColorMap(texture: Texture): void;
             setColor2Map(texture: Texture): void;
             setDetailMap(texture: Texture): void;
             setNormalMap(texture: Texture): void;
             setCubeMap(texture: Texture): void;
             setAlphaTest(alphaTest: boolean): void;
             /**
              * @deprecated Please use `setAlphaTest` instead.
              */
             set alphaTest(alphaTest: boolean);
             setAlphaTestReference(alphaTestReference: number): void;
             /**
              * @deprecated Please use `setAlphaTestReference` instead.
              */
             set alphaTestReference(alphaTestReference: number);
             getColorMapSize(size?: vec2): vec2;
             addParameter(name: string, type: MateriaParameterType, value: any, changed?: ParameterChanged): MateriaParameter;
             removeParameter(name: string): void;
             getParameter(name: string): MateriaParameter | undefined;
             setParameterValue(name: string, value: MateriaParameterValue): void;
             setColor4Uniform(uniformName: string, value: UniformValue): void;
             toJSON(): any;
             static constructFromJSON(json: JSONObject): Promise<Material>;
             fromJSON(json: JSONObject): void;
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

         export declare const MATERIAL_CULLING_BACK = 1029;

         export declare const MATERIAL_CULLING_FRONT = 1028;

         export declare const MATERIAL_CULLING_FRONT_AND_BACK = 1032;

         export declare const MATERIAL_CULLING_NONE = 0;

         declare enum MaterialColorMode {
             None = 0,
             PerVertex = 1,
             PerMesh = 2
         }

         declare type MaterialParam = any;

         declare type MaterialParams = {
             [key: string]: MaterialParam;
         };

         declare type MaterialParams_2 = {
             depthTest?: boolean;
             renderFace?: RenderFace;
             polygonOffset?: boolean;
             polygonOffsetFactor?: number;
             polygonOffsetUnits?: number;
         };

         export declare class MateriaParameter {
             #private;
             constructor(name: string, type: MateriaParameterType, value: MateriaParameterValue, changed?: ParameterChanged);
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

         declare type MateriaParameterValue = null | boolean | number | vec2 | vec3 | vec4 | mat2 | mat3 | mat4 | Texture;

         export declare const MAX_FLOATS = 4096;

         declare class MdlAttachment {
             name: string;
             lowcasename: string;
             mdl: SourceMdl | null;
             flags: number;
             localbone: number;
             local: Tuple<number, 12>;
         }

         declare class MdlBodyPart {
             name: string;
             base: number;
             models: ModelTest[];
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
             _parent: MdlBone | null;
             dirty: boolean;
             lastComputed: number;
             parentBone: number;
             boneId: number;
             name: string;
             lowcasename: string;
             bonecontroller: number[];
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
             set parent(parent: MdlBone);
             get parent(): MdlBone;
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

         declare class MdlEyeball {
             name: string;
             bone: number;
             readonly org: vec3;
             zoffset: number;
             radius: number;
             readonly up: vec3;
             readonly forward: vec3;
             texture: number;
             irisScale: number;
             readonly upperflexdesc: number[];
             readonly lowerflexdesc: number[];
             readonly uppertarget: vec3;
             readonly lowertarget: vec3;
             upperlidflexdesc: number;
             lowerlidflexdesc: number;
             m_bNonFACS: number;
         }

         declare class MdlStripHeader {
             vertices: any[];
             indexes: any[];
             numIndices: number;
             indexOffset: number;
             numVerts: number;
             vertOffset: number;
             numBones: number;
             flags: number;
             numBoneStateChanges: number;
             boneStateChangeOffset: number;
         }

         declare class MdlStudioAnim {
             readonly animValuePtrRot: MdlStudioAnimValuePtr;
             readonly animValuePtrPos: MdlStudioAnimValuePtr;
             readonly rawpos: vec3;
             readonly rawrot: quat;
             readonly rawrot2: quat;
             flags: number;
             bone: number;
             nextOffset: number;
             getRotValue(): MdlStudioAnimValuePtr | null;
             getPosValue(): MdlStudioAnimValuePtr | null;
             getQuaternion48(): quat;
             getQuaternion64(): quat;
             /**
              * TODO
              */
             getRot(rot: vec3, mdl: SourceMdl, bone: MdlBone, frame: number): vec3;
             getPos(pos: vec3, mdl: SourceMdl, bone: MdlBone, frame: number): vec3;
             readValue(mdl: SourceMdl, frame: number, offset: number): number;
         }

         declare class MdlStudioAnimDesc {
             name: string;
             mdl: SourceMdl | null;
             startOffset: number;
             fps: number;
             flags: number;
             numframes: number;
             nummovements: number;
             animblock: number;
             animIndex: number;
             numikrules: number;
             animblockikruleOffset: number;
             numlocalhierarchy: number;
             localhierarchyOffset: number;
             sectionOffset: number;
             sectionframes: number;
             zeroframespan: number;
             zeroframecount: number;
             zeroframeOffset: number;
             readonly frames: never[];
             pAnim(frameIndex: number): MdlStudioAnim[] | null;
             pZeroFrameData(): null;
         }

         /**
          *	MdlStudioAnimValuePtr
          */
         declare class MdlStudioAnimValuePtr {
             offset: number[];
             base: number;
             getAnimValue2(i: number): number;
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

         declare class MdlStudioFlex {
             flexdesc: number;
             target0: number;
             target1: number;
             target2: number;
             target3: number;
             numverts: number;
             vertindex: number;
             flexpair: number;
             vertanimtype: number;
             readonly vertAnims: MdlStudioVertAnim[];
         }

         declare class MdlStudioFlexController {
             localToGlobal: number;
             min: number;
             max: number;
             type: string;
             name: string;
         }

         declare class MdlStudioFlexOp {
             op: number;
             index: number;
             value: number;
         }

         declare class MdlStudioFlexRule {
             readonly ops: MdlStudioFlexOp[];
             flex: number;
         }

         declare class MdlStudioHitbox {
             name: string;
             readonly bbmin: vec3;
             readonly bbmax: vec3;
             boneId: number;
             groupId: number;
         }

         declare class MdlStudioHitboxSet {
             name: string;
             hitboxes: MdlStudioHitbox[];
         }

         declare class MdlStudioModelGroup {
             name: string;
             label: string;
         }

         declare class MdlStudioPoseParam {
             name: string;
             flags: number;
             start: number;
             end: number;
             loop: number;
             midpoint: number;
         }

         declare class MdlStudioSeqDesc {
             paramindex: number[];
             paramstart: number[];
             paramend: number[];
             blend: number[][];
             weightlist: number[];
             groupsize: number[];
             mdl: SourceMdl;
             previousTime: number;
             currentTime: number;
             posekeyindex: number;
             autolayer: MdlStudioAutoLayer[];
             events: MdlStudioEvent[];
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
             pBoneweight(boneIndex: any): number;
             getBlend(x: any, y: any): number;
             poseKey(iParam: any, iAnim: any): number;
             getAutoLayer(autoLayerIndex: any): MdlStudioAutoLayer;
             get length(): number;
             play(dynamicProp: any): any;
             processEvent(event: any, dynamicProp: any): void;
         }

         declare class MdlStudioVertAnim {
             index: number;
             speed: number;
             side: number;
             readonly flDelta: number[];
             readonly flNDelta: number[];
         }

         declare class MdlTexture {
             name: string;
             originalName: string;
         }

         declare class MdlVertex {
             boneWeightIndex: number[];
             boneID: number[];
             numBones: number;
             origMeshVertID: number;
         }

         /**
          * Cache the result of the underlying repository
          */
         export declare class MemoryCacheRepository implements Repository {
             #private;
             active: boolean;
             constructor(base: Repository);
             get name(): string;
             getFile(filename: string): Promise<RepositoryFileResponse>;
             getFileAsArrayBuffer(filename: string): Promise<RepositoryArrayBufferResponse>;
             getFileAsText(filename: string): Promise<RepositoryTextResponse>;
             getFileAsBlob(filename: string): Promise<RepositoryBlobResponse>;
             getFileAsJson(filename: string): Promise<RepositoryJsonResponse>;
             getFileList(): Promise<RepositoryFileListResponse>;
         }

         export declare class MemoryRepository implements Repository {
             #private;
             active: boolean;
             constructor(name: string);
             get name(): string;
             getFile(filename: string): Promise<RepositoryFileResponse>;
             getFileAsArrayBuffer(filename: string): Promise<RepositoryArrayBufferResponse>;
             getFileAsText(filename: string): Promise<RepositoryTextResponse>;
             getFileAsBlob(filename: string): Promise<RepositoryBlobResponse>;
             getFileAsJson(filename: string): Promise<RepositoryJsonResponse>;
             getFileList(): Promise<RepositoryFileListResponse>;
             setFile(path: string, file: File): Promise<RepositoryError | null>;
         }

         export declare class MergeRepository implements Repository {
             #private;
             active: boolean;
             constructor(name: string, ...repositories: Repository[]);
             get name(): string;
             getFile(filename: string): Promise<RepositoryFileResponse>;
             getFileAsArrayBuffer(filename: string): Promise<RepositoryArrayBufferResponse>;
             getFileAsText(filename: string): Promise<RepositoryTextResponse>;
             getFileAsBlob(filename: string): Promise<RepositoryBlobResponse>;
             getFileAsJson(filename: string): Promise<RepositoryJsonResponse>;
             getFileList(): Promise<RepositoryFileListResponse>;
             pushRepository(repo: Repository): void;
             unshiftRepository(repo: Repository): void;
             getSubRepositories(): Set<Repository>;
         }

         export declare class Mesh extends Entity {
             #private;
             renderMode: number;
             isRenderable: boolean;
             uniforms: Record<string, any>;
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
             setUniform(name: string, uniform: UniformValue): void;
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
             raycast(raycaster: Raycaster, intersections: Intersection[]): void;
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

         declare class MeshTest {
             render: boolean;
             model: ModelTest;
             material: number;
             modelindex: number;
             numvertices: number;
             vertexoffset: number;
             numflexes: number;
             flexindex: number;
             materialtype: number;
             materialparam: number;
             meshid: number;
             readonly center: vec3;
             readonly flexes: MdlStudioFlex[];
             initialized: boolean;
             constructor(model: ModelTest);
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
             setBalls(balls: Metaball[]): void;
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
             load(repositoryName: string, fileName: string): Promise<SourceModel | null>;
         }

         declare class ModelTest {
             render: boolean;
             name: string;
             type: number;
             boundingradius: number;
             readonly meshArray: MeshTest[];
             readonly vertexArray: never[];
             readonly eyeballArray: MdlEyeball[];
             numvertices: number;
             vertexindex: number;
             tangentsindex: number;
             numattachments: number;
             attachmentindex: number;
             numeyeballs: number;
             eyeballindex: number;
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
             #private;
             _paramChanged(paramName: string, param: OperatorParam): void;
             doOperate(particle: Source2Particle, elapsedTime: number, strength: number): void;
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
             outputs: Map<string, Output>;
             params: Map<string, NodeParam>;
             previewPic: HTMLImageElement;
             previewSize: number;
             autoRedraw: boolean;
             protected material: Material;
             constructor(editor: NodeImageEditor, params?: any);
             addInput(inputId: any, inputType: any, size?: number): Input;
             addOutput(outputId: any, outputType: any): Output;
             getInput(inputId: any): Input;
             getOutput(outputId: any): Output;
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
             revalidate(): Promise<void>;
             redraw(context?: any): Promise<void>;
             getInputCount(): number;
             getType(): void;
             ready(): Promise<unknown>;
             isValid(startingPoint?: Node_2): any;
             hasSuccessor(): boolean;
             successorsLength(): number;
             get title(): string;
             updatePreview(context?: any): void;
             savePicture(filename?: string): Promise<void>;
             saveVTF(filename?: string): Promise<void>;
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
             NodeImageEditor: any;
             removeNode(node: any): void;
             removeAllNodes(): void;
             getVariable(name: any): number;
             setVariable(name: any, value: any): Map<string, number>;
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
             #private;
             constructor(system: Source2ParticleSystem);
             _paramChanged(paramName: string, param: OperatorParam): void;
             doOperate(particle: Source2Particle, elapsedTime: number, strength: number): void;
         }

         export declare class NoiseEmitter extends Emitter {
             #private;
             _paramChanged(paramName: string, param: OperatorParam): void;
             doEmit(elapsedTime: number): void;
         }

         export declare class NormalAlignToCP extends Operator {
             _paramChanged(paramName: string, param: OperatorParam): void;
             doInit(particle: Source2Particle, elapsedTime: number, strength: number): void;
         }

         export declare class NormalizeVector extends Operator {
             #private;
             _paramChanged(paramName: string, param: OperatorParam): void;
             doOperate(particle: Source2Particle, elapsedTime: number, strength: number): void;
         }

         export declare class NormalLock extends Operator {
             doOperate(particle: Source2Particle, elapsedTime: number, strength: number): void;
         }

         export declare class NormalOffset extends Operator {
             #private;
             _paramChanged(paramName: string, param: OperatorParam): void;
             doInit(particle: Source2Particle, elapsedTime: number, strength: number): void;
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

         export declare class OldMoviePass extends Pass {
             constructor(camera: Camera);
             render(renderer: Graphics, readBuffer: RenderTarget, writeBuffer: RenderTarget, renderToScreen: boolean, delta: number, context: RenderContext): void;
         }

         export declare const ONE_EPS = 1.0000001;

         declare class Operator {
             #private;
             static PVEC_TYPE_PARTICLE_VECTOR: boolean;
             system: Source2ParticleSystem;
             protected opStartFadeInTime: number;
             protected opEndFadeInTime: number;
             protected opStartFadeOutTime: number;
             protected opEndFadeOutTime: number;
             protected opFadeOscillatePeriod: number;
             disableOperator: boolean;
             controlPointNumber: number;
             protected fieldOutput: number;
             scaleCp: number;
             mesh?: Mesh;
             endCapState?: number;
             currentTime: number;
             operateAllParticlesRemoveme: boolean;
             protected setMethod: Source2ParticleSetMethod;
             associatedEmitterIndex: number;
             constructor(system: Source2ParticleSystem);
             setParam(paramName: string, param: OperatorParam): void;
             getParamScalarValue(paramName: string, particle?: Source2Particle): number | null;
             getParamVectorValue(out: vec4, paramName: string, particle?: Source2Particle): vec4 | undefined | null;
             _paramChanged(paramName: string, param: OperatorParam): void;
             initializeParticle(particles: Source2Particle, elapsedTime: number): void;
             operateParticle(particle: Source2Particle | null | Source2Particle[], elapsedTime: number): void;
             forceParticle(particle: Source2Particle, elapsedTime: number, accumulatedForces: vec3): void;
             constraintParticle(particle: Source2Particle): void;
             renderParticle(particleList: Source2Particle, elapsedTime: number, material: Source2Material): void;
             fadeInOut(): number;
             setParameter(name: string, type: OperatorParamType, value: OperatorParamValueType): this;
             getParameter(name: string): OperatorParam | null;
             getParameters(): Map<string, OperatorParam>;
             setParameters(parameters: Record<string, any>): this;
             doNothing(): void;
             reset(): void;
             getOperatorFade(): number;
             getInputValue(inputField: number, particle: Source2Particle): any;
             getInputValueAsVector(inputField: number, particle: Source2Particle, v: vec4): void;
             setOutputValue(outputField: number, value: any, particle: Source2Particle): void;
             initMultipleOverride(): boolean;
             isPreEmission(): boolean;
             setOrientationType(orientationType: string | number | bigint): void;
             init(): void;
             dispose(): void;
             doInit(particle: Source2Particle, elapsedTime: number, strength: number): void;
             doEmit(elapsedTime: number): void;
             doOperate(particle: Source2Particle | null | Source2Particle[], elapsedTime: number, strength: number): void;
             doForce(particle: Source2Particle, elapsedTime: number, accumulatedForces: vec3, strength: number): void;
             applyConstraint(particle: Source2Particle): void;
             doRender(particle: Source2Particle, elapsedTime: number, material: Source2Material): void;
             initRenderer(particleSystem: Source2ParticleSystem): void;
             updateParticles(particleSystem: Source2ParticleSystem, particleList: Source2Particle[], elapsedTime: number): void;
         }

         declare class OperatorParam {
             #private;
             isOperatorParam: true;
             constructor(name: string, type: OperatorParamType, value: OperatorParamValueType);
             getName(): string;
             getType(): OperatorParamType;
             getValueAsBool(): boolean | null;
             getValueAsNumber(): number | null;
             getValueAsString(): string | null;
             getValueAsArray(): OperatorParamValueType[] | null;
             getValueAsVec2(out: vec2): vec2 | null;
             getValueAsVec3(out: vec3): vec3 | null;
             getValueAsVec4(out: vec4): vec4 | null;
             getSubValue(name: string): OperatorParam | null;
             getSubValueAsBool(name: string): boolean | null;
             getSubValueAsNumber(name: string): number | null;
             getSubValueAsString(name: string): string | null;
             getSubValueAsArray(name: string): OperatorParamValueType[] | null;
             getSubValueAsVec2(name: string, out: vec2): vec2 | null;
             getSubValueAsVec3(name: string, out: vec3): vec3 | null;
             static fromKv3(name: string, kv3: Kv3Element | Kv3Value | null): OperatorParam;
         }

         declare enum OperatorParamType {
             Null = 0,
             Element = 1,
             Bool = 2,
             Number = 3,
             BigInt = 4,
             String = 5,
             Array = 6
         }

         declare type OperatorParamValueType = null | boolean | number | bigint | string | OperatorParam | OperatorParamValueType[] | Map<string, OperatorParam> | Uint8Array | Float32Array;

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

         export declare class OrientTo2dDirection extends SourceEngineParticleOperator {
             #private;
             static functionName: string;
             paramChanged(name: string, param: CDmxAttributeValue | CDmxAttributeValue[]): void;
             doOperate(particle: SourceEngineParticle, elapsedTime: number): void;
         }

         export declare class OscillateScalar extends SourceEngineParticleOperator {
             static functionName: string;
             constructor();
             doOperate(particle: any, elapsedTime: any): void;
         }

         export declare class OscillateScalarSimple extends Operator {
             #private;
             _paramChanged(paramName: string, param: OperatorParam): void;
             doOperate(particle: Source2Particle, elapsedTime: number, strength: number): void;
         }

         export declare class OscillateVector extends SourceEngineParticleOperator {
             static functionName: string;
             constructor();
             doOperate(particle: any, elapsedTime: any): void;
         }

         export declare class OutlinePass extends Pass {
             #private;
             outlineScene: Scene;
             width: number;
             height: number;
             constructor(outlineScene: Scene, camera: Camera);
             setSize(width: any, height: any): void;
             changeVisibilityOfSelectedObjects(visible: any): void;
             changeVisibilityOfNonSelectedObjects(visible: any): void;
             render(renderer: Graphics, readBuffer: RenderTarget, writeBuffer: RenderTarget, renderToScreen: boolean, delta: number, context: RenderContext): void;
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
             active: boolean;
             constructor(base: Repository);
             get name(): string;
             getFile(filename: string): Promise<RepositoryFileResponse>;
             getFileAsArrayBuffer(filename: string): Promise<RepositoryArrayBufferResponse>;
             getFileAsText(filename: string): Promise<RepositoryTextResponse>;
             getFileAsBlob(filename: string): Promise<RepositoryBlobResponse>;
             getFileAsJson(filename: string): Promise<RepositoryJsonResponse>;
             getFileList(): Promise<RepositoryFileListResponse>;
             overrideFile(filename: string, file: File): Promise<RepositoryError | null>;
         }

         export declare class PalettePass extends Pass {
             constructor(camera: any);
             render(renderer: Graphics, readBuffer: RenderTarget, writeBuffer: RenderTarget, renderToScreen: boolean, delta: number, context: RenderContext): void;
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

         export declare interface ParentChangedEventData {
             child: Entity;
             oldParent: Entity | null;
             newParent: Entity | null;
         }

         export declare function ParticleRandomFloat(id: any, offset: any): any;

         export declare function ParticleRandomVec3(vec: any, id: any, offset1: any, offset2: any, offset3: any): any;

         export declare class Pass {
             camera?: Camera;
             quad?: FullScreenQuad;
             scene?: Scene;
             enabled: boolean;
             swapBuffers: boolean;
             renderToScreen: boolean;
             setSize(width: number, height: number): void;
             render(renderer: Graphics, readBuffer: RenderTarget, writeBuffer: RenderTarget, renderToScreen: boolean, delta: number, context: RenderContext): void;
         }

         export declare class Path extends Curve {
             looping: boolean;
             _curves: Curve[];
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

         export declare class PathPrefixRepository implements Repository {
             #private;
             prefix: string;
             active: boolean;
             constructor(name: string, base: Repository, prefix?: string);
             get name(): string;
             getFile(path: string): Promise<RepositoryFileResponse>;
             getFileAsArrayBuffer(path: string): Promise<RepositoryArrayBufferResponse>;
             getFileAsText(path: string): Promise<RepositoryTextResponse>;
             getFileAsBlob(path: string): Promise<RepositoryBlobResponse>;
             getFileAsJson(path: string): Promise<RepositoryJsonResponse>;
             getFileList(): Promise<RepositoryFileListResponse>;
         }

         export declare function pcfToSTring(pcf: SourcePCF): {
             text: string;
             elementsLine: Map<string, number>;
         } | null;

         export declare const PI: number;

         export declare class PinParticleToCP extends Operator {
             #private;
             static doOnce: boolean;
             _paramChanged(paramName: string, param: OperatorParam): void;
             doOperate(particle: Source2Particle | null | Source2Particle[], elapsedTime: number, strength: number): void;
         }

         export declare class PixelatePass extends Pass {
             #private;
             constructor(camera: any);
             set horizontalTiles(horizontalTiles: any);
             set pixelStyle(pixelStyle: any);
             render(renderer: Graphics, readBuffer: RenderTarget, writeBuffer: RenderTarget, renderToScreen: boolean, delta: number, context: RenderContext): void;
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
             static constructFromJSON(json: JSONObject, entities: Map<string, Entity | Material>, loadedPromise: Promise<void>): Promise<Plane>;
             static getEntityName(): string;
         }

         export declare class PlaneCull extends Operator {
             #private;
             constructor(system: Source2ParticleSystem);
             _paramChanged(paramName: string, param: OperatorParam): void;
             doOperate(particle: Source2Particle, elapsedTime: number, strength: number): void;
         }

         export declare class PointLight extends Light {
             isPointLight: boolean;
             constructor(params?: PointLightParameters);
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

         declare type PointLightParameters = LightParameters & {
             range?: number;
         };

         export declare function polygonise(/*GRIDCELL */ grid: GRIDCELL, /*double */ isolevel: number, /*TRIANGLE **/ triangles: TRIANGLE[]): number;

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
             #private;
             static functionName: string;
             paramChanged(name: string, param: CDmxAttributeValue | CDmxAttributeValue[]): void;
             doInit(particle: SourceEngineParticle, elapsedTime: number): void;
         }

         export declare class PositionLock extends Operator {
             #private;
             constructor(system: Source2ParticleSystem);
             _paramChanged(paramName: string, param: OperatorParam): void;
             doOperate(particle: Source2Particle, elapsedTime: number, strength: number): void;
         }

         export declare class PositionModifyOffsetRandom extends SourceEngineParticleOperator {
             static functionName: string;
             constructor();
             doInit(particle: any, elapsedTime: any): void;
             initMultipleOverride(): boolean;
         }

         export declare class PositionOffset extends Operator {
             #private;
             _paramChanged(paramName: string, param: OperatorParam): void;
             doInit(particle: Source2Particle, elapsedTime: number, strength: number): void;
             initMultipleOverride(): boolean;
         }

         export declare class PositionOnModelRandom extends SourceEngineParticleOperator {
             static functionName: string;
             constructor();
             doInit(particle: SourceEngineParticle, elapsedTime: number): void;
         }

         export declare class PositionWarp extends Operator {
             #private;
             _paramChanged(paramName: string, param: OperatorParam): void;
             doInit(particle: Source2Particle, elapsedTime: number, strength: number): void;
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

         export declare class Properties {
             #private;
             set(name: string, property: Property): void;
             delete(name: string): void;
             get(name: string): Property | undefined;
             copy(source: Properties, keys?: string[]): void;
             setString(name: string, value: string): void;
             getString(name: string): string | undefined;
             setBoolean(name: string, value: boolean): void;
             getBoolean(name: string): boolean | undefined;
             setNumber(name: string, value: number): void;
             getNumber(name: string): number | undefined;
             setBigint(name: string, value: bigint): void;
             getBigint(name: string): bigint | undefined;
             setArray(name: string, value: any[]): void;
             getArray(name: string): any[] | undefined;
             setObject(name: string, value: object): void;
             getObject(name: string): object | undefined;
         }

         export declare class Property {
             type: string;
             value: PropertyValues;
             constructor(type: string, value: PropertyValues);
         }

         export declare const PROPERTY_CHANGED = "propertychanged";

         export declare interface PropertyChangedEventData {
             entity: Entity;
             name: string;
             value: any;
             oldValue: any;
         }

         export declare enum PropertyType {
             Null = "null",
             Undefined = "undefined",
             String = "string",
             Number = "number",
             Bigint = "bigint",
             Boolean = "boolean",
             Array = "array",
             Object = "object"
         }

         export declare type PropertyValues = string | number | bigint | any | any[];

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

         declare type ProxyParams = Record<string, any>;

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

         export declare function quatToEuler(out: vec3, q: quat): vec3;

         export declare function quatToEulerDeg(out: vec3, q: quat): vec3;

         export declare const RAD_TO_DEG: number;

         export declare class RadiusFromCPObject extends Operator {
             doInit(particle: Source2Particle, elapsedTime: number, strength: number): void;
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
             #private;
             _paramChanged(paramName: string, param: OperatorParam): void;
             doOperate(particle: Source2Particle, elapsedTime: number, strength: number): void;
         }

         export declare class RampScalarLinearSimple extends Operator {
             #private;
             _paramChanged(paramName: string, param: OperatorParam): void;
             doOperate(particle: Source2Particle, elapsedTime: number, strength: number): void;
         }

         export declare class RampScalarSpline extends Operator {
             #private;
             _paramChanged(paramName: string, param: OperatorParam): void;
             doOperate(particle: Source2Particle, elapsedTime: number, strength: number): void;
         }

         export declare class RandomColor extends Operator {
             #private;
             _paramChanged(paramName: string, param: OperatorParam): void;
             doInit(particle: Source2Particle, elapsedTime: number, strength: number): void;
         }

         export declare function RandomFloat(min: number, max: number): number;

         export declare function RandomFloatExp(min: number, max: number, exponent: number): number;

         export declare class RandomForce extends SourceEngineParticleOperator {
             static functionName: string;
             constructor();
             doForce(particle: any, elapsedTime: any, accumulatedForces: any): void;
         }

         declare interface RandomPointOnModel {
             getRandomPointOnModel(vec: vec3, initialVec: vec3, bones: [Bone, number][]): vec3;
         }

         export declare class RandomSecondSequence extends Operator {
             #private;
             _paramChanged(paramName: string, param: OperatorParam): void;
             doInit(particle: Source2Particle, elapsedTime: number, strength: number): void;
         }

         export declare class RandomSequence extends Operator {
             #private;
             _paramChanged(paramName: string, param: OperatorParam): void;
             doInit(particle: Source2Particle, elapsedTime: number, strength: number): void;
         }

         export declare function RandomVectorInUnitSphere(out: vec3): number;

         export declare class RandomYawFlip extends Operator {
             #private;
             _paramChanged(paramName: string, param: OperatorParam): void;
             doInit(particle: Source2Particle, elapsedTime: number, strength: number): void;
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
             castRay(origin: vec3, direction: vec3, entities: Entity[] | Set<Entity>, recursive: boolean): Intersection[];
             castCameraRay(camera: Camera, normalizedX: number, normalizedY: number, entities: Entity[] | Set<Entity>, recursive: boolean): Intersection[];
             intersectEntity(entity: Entity, intersections: Intersection[], recursive: boolean): void;
         }

         export declare class RefractMaterial extends SourceEngineMaterial {
             clone(): RefractMaterial;
             getShaderSource(): string;
         }

         export declare function registerLoader(name: string, loader: any): void;

         export declare class RemapControlPointDirectionToVector extends Operator {
             #private;
             _paramChanged(paramName: string, param: OperatorParam): void;
             doOperate(particle: Source2Particle, elapsedTime: number, strength: number): void;
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
             _paramChanged(paramName: string, param: OperatorParam): void;
             doOperate(particle: Source2Particle, elapsedTime: number, strength: number): void;
         }

         export declare class RemapCPSpeedToCP extends SourceEngineParticleOperator {
             static functionName: string;
             constructor();
             doOperate(particle: any, elapsedTime: any): void;
         }

         export declare class RemapCPtoScalar extends Operator {
             #private;
             _paramChanged(paramName: string, param: OperatorParam): void;
             doOperate(particle: Source2Particle, elapsedTime: number, strength: number): void;
         }

         export declare class RemapCPtoVector extends Operator {
             #private;
             _paramChanged(paramName: string, param: OperatorParam): void;
             doInit(particle: Source2Particle, elapsedTime: number, strength: number): void;
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
             #private;
             remapBias: number;
             _paramChanged(paramName: string, param: OperatorParam): void;
             doInit(particle: Source2Particle, elapsedTime: number, strength: number): void;
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

         export declare class RemapSpeed extends Operator {
             #private;
             _paramChanged(paramName: string, param: OperatorParam): void;
             doOperate(particle: Source2Particle, elapsedTime: number, strength: number): void;
         }

         export declare class RemapSpeedtoCP extends Operator {
             #private;
             _paramChanged(paramName: string, param: OperatorParam): void;
             doOperate(particle: Source2Particle, elapsedTime: number, strength: number): void;
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
             geometry: BufferGeometry;
             imgData: any;
             constructor();
             updateParticles(particleSystem: any, particleList: any): void;
             set maxParticles(maxParticles: any);
             initRenderer(particleSystem: any): void;
             updateParticlesTexture(): void;
             dispose(): void;
         }

         declare class RenderBase extends Operator {
             #private;
             protected material: Source2SpriteCard;
             protected setDefaultTexture: boolean;
             protected spriteSheet: Source2SpriteSheet | null;
             constructor(system: Source2ParticleSystem);
             setMaterial(material: Source2SpriteCard): void;
             _paramChanged(paramName: string, param: OperatorParam): void;
             setTexture(texturePath: string): Promise<void>;
         }

         export declare class RenderBlobs extends RenderBase {
             #private;
             constructor(system: Source2ParticleSystem);
             _paramChanged(paramName: string, param: OperatorParam): void;
             initRenderer(particleSystem: Source2ParticleSystem): void;
             updateParticles(particleSystem: Source2ParticleSystem, particleList: Source2Particle[], elapsedTime: number): void;
         }

         export declare class Renderbuffer {
             #private;
             constructor(internalFormat: RenderBufferInternalFormat, width: number, height: number, samples?: number);
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

         declare interface RenderContext {
             DisableToolRendering?: boolean;
         }

         export declare class RenderDeferredLight extends RenderBase {
             #private;
             _paramChanged(paramName: string, param: OperatorParam): void;
             initRenderer(particleSystem: Source2ParticleSystem): void;
             updateParticles(particleSystem: Source2ParticleSystem, particleList: Source2Particle[], elapsedTime: number): void;
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
             _prepareRenderList(renderList: RenderList, scene: Scene, camera: Camera, delta: number, context: RenderContext): void;
             _renderRenderList(renderList: RenderList, camera: Camera, renderLights: boolean, context: RenderContext, lightPos?: vec3): void;
             render(scene: Scene, camera: Camera, delta: number, context: RenderContext): void;
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
             lights: Light[];
             pointLights: PointLight[];
             spotLights: SpotLight[];
             ambientLights: AmbientLight[];
             transparentList: Mesh[];
             opaqueList: Mesh[];
             pointLightShadows: number;
             spotLightShadows: number;
             reset(): void;
             finish(): void;
             addObject(entity: Entity): void;
         }

         export declare class RenderModels extends Operator {
             #private;
             _paramChanged(paramName: string, param: OperatorParam): void;
             initRenderer(particleSystem: Source2ParticleSystem): void;
             updateParticles(particleSystem: Source2ParticleSystem, particleList: Source2Particle[], elapsedTime: number): void;
             dispose(): void;
         }

         export declare class RenderPass extends Pass {
             constructor(scene: Scene, camera: Camera);
             render(renderer: Graphics, readBuffer: RenderTarget, writeBuffer: RenderTarget, renderToScreen: boolean, delta: number, context: RenderContext): void;
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
             dispose(): void;
         }

         export declare class RenderRopes extends RenderBase {
             #private;
             constructor(system: Source2ParticleSystem);
             _paramChanged(paramName: string, param: OperatorParam): void;
             setSequenceCombineMode(sequenceCombineMode: string): void;
             updateParticles(particleSystem: Source2ParticleSystem, particleList: Source2Particle[], elapsedTime: number): void;
             set maxParticles(maxParticles: number);
             initRenderer(particleSystem: Source2ParticleSystem): void;
             updateParticlesTexture(): void;
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
             texture: Texture_3;
             imgData: Float32Array;
             constructor(system: Source2ParticleSystem);
             _paramChanged(paramName: string, param: OperatorParam): void;
             setSequenceCombineMode(sequenceCombineMode: string): void;
             updateParticles(particleSystem: Source2ParticleSystem, particleList: Source2Particle[], elapsedTime: number): void;
             setMaxParticles(maxParticles: number): void;
             /**
              * @deprecated Please use `setPosition` instead.
              */
             set maxParticles(maxParticles: number);
             initRenderer(particleSystem: Source2ParticleSystem): void;
             updateParticlesTexture(): void;
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

         export declare class RenderTrails extends RenderBase {
             #private;
             constructor(system: Source2ParticleSystem);
             _paramChanged(paramName: string, param: OperatorParam): void;
             setSequenceCombineMode(sequenceCombineMode: string): void;
             updateParticles(particleSystem: Source2ParticleSystem, particleList: Source2Particle[], elapsedTime: number): void;
             set maxParticles(maxParticles: number);
             initRenderer(particleSystem: Source2ParticleSystem): void;
             updateParticlesTexture(): void;
             init(): void;
         }

         export declare class RepeatedTriggerChildGroup extends Operator {
             _paramChanged(paramName: string, param: OperatorParam): void;
             doOperate(particle: Source2Particle, elapsedTime: number, strength: number): void;
         }

         export declare class Repositories {
             #private;
             static addRepository(repo: Repository): Repository;
             static getRepository(name: string): Repository | undefined;
             static getRepositoryList(): string[];
             static getFile(repositoryName: string, filepath: string): Promise<RepositoryFileResponse>;
             static getFileAsArrayBuffer(repositoryName: string, filepath: string): Promise<RepositoryArrayBufferResponse>;
             static getFileAsText(repositoryName: string, filepath: string): Promise<RepositoryTextResponse>;
             static getFileAsBlob(repositoryName: string, filepath: string): Promise<RepositoryBlobResponse>;
             static getFileAsJson(repositoryName: string, filepath: string): Promise<RepositoryJsonResponse>;
         }

         export declare interface Repository {
             name: string;
             active: boolean;
             getFile: (path: string) => Promise<RepositoryFileResponse>;
             getFileAsArrayBuffer: (path: string) => Promise<RepositoryArrayBufferResponse>;
             getFileAsText: (path: string) => Promise<RepositoryTextResponse>;
             getFileAsBlob: (path: string) => Promise<RepositoryBlobResponse>;
             getFileAsJson: (path: string) => Promise<RepositoryJsonResponse>;
             getFileList: () => Promise<RepositoryFileListResponse>;
         }

         export declare interface RepositoryArrayBufferResponse {
             buffer?: ArrayBuffer | null;
             error?: RepositoryError;
         }

         export declare interface RepositoryBlobResponse {
             blob?: Blob | null;
             error?: RepositoryError;
         }

         export declare class RepositoryEntry {
             #private;
             constructor(repository: Repository, name: string, isDirectory: boolean, depth: number);
             addPath(path: string): void;
             removeEntry(name: string): void;
             setName(name: string): void;
             getName(): string;
             getFullName(): string;
             setParent(parent: RepositoryEntry | null): void;
             getParent(): RepositoryEntry | null;
             setRepository(repository: Repository): void;
             getRepository(): Repository;
             getChild(name: string): RepositoryEntry | undefined;
             getChilds(filter?: RepositoryFilter): Generator<RepositoryEntry, null, undefined>;
             getAllChilds(filter?: RepositoryFilter): Set<RepositoryEntry>;
             getPath(path: string): RepositoryEntry | null;
             isDirectory(): boolean;
             toJSON(): JSON;
             merge(other: RepositoryEntry): void;
         }

         export declare enum RepositoryError {
             FileNotFound = 1,
             UnknownError = 2,
             NotSupported = 3,
             RepoNotFound = 4,
             RepoInactive = 5
         }

         export declare interface RepositoryFileListResponse {
             root?: RepositoryEntry;
             error?: RepositoryError;
         }

         export declare interface RepositoryFileResponse {
             file?: File | null;
             error?: RepositoryError;
         }

         export declare interface RepositoryFilter {
             name?: string | RegExp;
             extension?: string | RegExp;
             directories?: boolean;
             files?: boolean;
             maxDepth?: number;
         }

         export declare interface RepositoryJsonResponse {
             json?: JSON | null;
             error?: RepositoryError;
         }

         export declare interface RepositoryTextResponse {
             text?: string | null;
             error?: RepositoryError;
         }

         export declare class RgbeImporter {
             #private;
             constructor(context: WebGLAnyRenderingContext);
             fetch(url: string): Promise<Texture_2 | "error while fetching resource">;
             import(reader: BinaryReader): Texture_2;
         }

         export declare class RingWave extends Operator {
             #private;
             t: number;
             _paramChanged(paramName: string, param: OperatorParam): void;
             doInit(particle: Source2Particle, elapsedTime: number, strength: number): void;
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
             render(renderer: Graphics, readBuffer: RenderTarget, writeBuffer: RenderTarget, renderToScreen: boolean, delta: number, context: RenderContext): void;
         }

         export declare class Scene extends Entity {
             #private;
             background?: BackGround;
             layers: Set<any>;
             environment?: Environment;
             activeCamera?: Camera;
             constructor(parameters?: SceneParameters);
             addLayer(layer: any, index: number): any;
             removeLayer(layer: any): void;
             setWorld(world: World): void;
             getWorld(): World;
             toString(): string;
             static constructFromJSON(json: JSONObject): Promise<Scene>;
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
             get htmlElement(): HTMLElement;
             applyFilter(): void;
             selectEntity(entity: Entity, scrollIntoView?: boolean): void;
             getSelectedEntity(): Entity;
             getEntityHtml(entity: Entity): void;
             showContextMenu(contextMenu: HarmonyMenuItems, x: number, y: number, entity: Entity): void;
             editMaterial(material: Material): void;
             setJointsRadius(radius: number): void;
         }

         declare type SceneParameters = EntityParameters;

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
             doInit(particle: Source2Particle, elapsedTime: number, strength: number): void;
         }

         export declare class SequenceRandom extends SourceEngineParticleOperator {
             static functionName: string;
             constructor();
             doInit(particle: any, elapsedTime: any): void;
         }

         export declare class SetChildControlPointsFromParticlePositions extends SourceEngineParticleOperator {
             #private;
             static functionName: string;
             constructor();
             paramChanged(name: string, param: CDmxAttributeValue | CDmxAttributeValue[]): void;
             doOperate(particle: SourceEngineParticle, elapsedTime: number): void;
         }

         export declare class SetControlPointFromObjectScale extends Operator {
             #private;
             _paramChanged(paramName: string, param: OperatorParam): void;
             doOperate(particle: Source2Particle, elapsedTime: number, strength: number): void;
             isPreEmission(): boolean;
         }

         export declare class SetControlPointOrientation extends Operator {
             #private;
             _paramChanged(paramName: string, param: OperatorParam): void;
             doOperate(particle: Source2Particle, elapsedTime: number, strength: number): void;
             isPreEmission(): boolean;
         }

         export declare class SetControlPointPositions extends SourceEngineParticleOperator {
             static functionName: string;
             constructor();
             doOperate(particle: any): void;
         }

         export declare class SetControlPointsToModelParticles extends Operator {
             #private;
             firstSourcePoint: number;
             _paramChanged(paramName: string, param: OperatorParam): void;
             doOperate(particle: Source2Particle, elapsedTime: number): void;
         }

         export declare class SetControlPointToCenter extends Operator {
             #private;
             _paramChanged(paramName: string, param: OperatorParam): void;
             doOperate(particle: Source2Particle, elapsedTime: number, strength: number): void;
             isPreEmission(): boolean;
         }

         export declare class SetControlPointToParticlesCenter extends SourceEngineParticleOperator {
             static functionName: string;
             constructor();
             doOperate(particle: any, elapsedTime: any): void;
         }

         export declare class SetCPOrientationToGroundNormal extends Operator {
             #private;
             _paramChanged(paramName: string, param: OperatorParam): void;
             doOperate(particle: Source2Particle, elapsedTime: number, strength: number): void;
         }

         export declare function setCustomIncludeSource(name: string, source: string): void;

         export declare function setFetchFunction(func: FetchFunction): void;

         export declare class SetFloat extends Operator {
             #private;
             outputField: number;
             _paramChanged(paramName: string, param: OperatorParam): void;
             doOperate(particle: Source2Particle, elapsedTime: number, strength: number): void;
         }

         export declare class SetParentControlPointsToChildCP extends Operator {
             #private;
             _paramChanged(paramName: string, param: OperatorParam): void;
             doOperate(particle: Source2Particle, elapsedTime: number, strength: number): void;
             isPreEmission(): boolean;
         }

         export declare class SetPerChildControlPoint extends Operator {
             #private;
             _paramChanged(paramName: string, param: OperatorParam): void;
             doOperate(particle: Source2Particle, elapsedTime: number, strength: number): void;
         }

         export declare class SetRandomControlPointPosition extends Operator {
             #private;
             cpMinPos: vec3;
             cpMaxPos: vec3;
             lastRandomTime: number;
             _paramChanged(paramName: string, param: OperatorParam): void;
             doOperate(particle: Source2Particle, elapsedTime: number, strength: number): void;
             isPreEmission(): boolean;
         }

         export declare class SetRigidAttachment extends Operator {
             #private;
             _paramChanged(paramName: string, param: OperatorParam): void;
             doInit(particle: Source2Particle, elapsedTime: number, strength: number): void;
         }

         export declare class SetSingleControlPointPosition extends Operator {
             #private;
             _paramChanged(paramName: string, param: OperatorParam): void;
             reset(): void;
             doOperate(particle: Source2Particle, elapsedTime: number, strength: number): void;
             isPreEmission(): boolean;
         }

         export declare function setTextureFactoryContext(c: WebGLAnyRenderingContext): void;

         export declare class SetToCP extends Operator {
             #private;
             _paramChanged(paramName: string, param: OperatorParam): void;
             doOperate(particle: Source2Particle, elapsedTime: number, strength: number): void;
         }

         export declare class SetVec extends Operator {
             #private;
             _paramChanged(paramName: string, param: OperatorParam): void;
             doOperate(particle: Source2Particle, elapsedTime: number, strength: number): void;
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

         export declare const Shaders: Record<string, string>;

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
             render(renderer: Renderer, renderList: RenderList, camera: Camera, context: RenderContext): void;
         }

         declare class ShapePath {
             type: string;
             subPaths: any[];
             currentPath: any;
             moveTo(x: any, y: any): this;
             lineTo(x: any, y: any): this;
             quadraticCurveTo(aCPx: any, aCPy: any, aX: any, aY: any): this;
             bezierCurveTo(aCP1x: any, aCP1y: any, aCP2x: any, aCP2y: any, aX: any, aY: any): this;
             splineThru(pts: any): this;
             toShapes(isCCW: any, noHoles: any): any[];
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
             _bones: Bone[];
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
             addBone(boneId: number, boneName: string): Bone;
             setParentSkeleton(skeleton: Skeleton | null): Promise<void>;
             getBoneByName(boneName: string): Bone;
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
             displayBoneJoints(display: boolean): void;
             setJointsRadius(radius: number): void;
             dispose(): void;
         }

         export declare class SketchPass extends Pass {
             constructor(camera: any);
             render(renderer: Graphics, readBuffer: RenderTarget, writeBuffer: RenderTarget, renderToScreen: boolean, delta: number, context: RenderContext): void;
         }

         export declare class SnapshotRigidSkinToBones extends Operator {
             #private;
             _paramChanged(paramName: string, param: OperatorParam): void;
             doOperate(particle: Source2Particle, elapsedTime: number, strength: number): void;
         }

         export declare type Source1ModelAnimation = {
             name: string;
             weight: number;
         };

         export declare class Source1ModelInstance extends Entity implements Animated, HasSkeleton, RandomPointOnModel {
             #private;
             isSource1ModelInstance: boolean;
             animable: boolean;
             hasAnimations: true;
             sourceModel: SourceModel;
             bodyParts: Record<string, Entity>;
             sequences: Source1ModelSequences;
             meshes: Set<Mesh | SkeletalMesh>;
             frame: number;
             anim: SourceAnimation;
             animationSpeed: number;
             isDynamic: boolean;
             static useNewAnimSystem: boolean;
             useNewAnimSystem: boolean;
             readonly frameframe: {
                 bones: Record<string, any>;
             };
             constructor(params?: any);
             get skeleton(): Skeleton;
             set skeleton(skeleton: Skeleton);
             addChild(child?: Entity | null): Entity;
             removeChild(child: Entity): void;
             set skin(skin: number);
             get skin(): number;
             setSkin(skin: number): Promise<void>;
             set sheen(sheen: vec3);
             set tint(tint: vec3 | null);
             getTint(out?: vec4): vec4 | undefined;
             setPoseParameter(paramName: string, paramValue: number): void;
             playAnimation(name: string): void;
             setAnimation(id: number, name: string, weight: number): Promise<void>;
             playSequence(sequenceName: string): void;
             addAnimation(id: number, animationName: string, weight?: number): Promise<void>;
             update(scene: Scene, camera: Camera, delta: number): void;
             _playSequences(delta: number): void;
             setMaterialOverride(materialOverride: Material | null): Promise<void>;
             getBoneById(boneId: number): Bone | undefined;
             renderBodyParts(render: boolean): void;
             renderBodyPart(bodyPartName: string, render: boolean): void;
             resetBodyPartModels(): void;
             setBodyPartIdModel(bodyPartId: number, modelId: number): void;
             setBodyPartModel(bodyPartName: string, modelId: number): void;
             getBodyGroups(): Map<string, number>;
             toString(): string;
             attachSystem(system: any, attachmentName?: string, cpIndex?: number, offset?: vec3): void;
             attachSystemToBone(system: any, boneName: any, offset: any): void;
             getAttachment(attachmentName: any): Bone;
             getBoneByName(boneName: any): Bone;
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
             getRandomPointOnModel(vec: vec3, initialVec: vec3, bones: [Bone, number][]): vec3;
             set position(position: vec3);
             get position(): vec3;
             set quaternion(quaternion: vec4);
             get quaternion(): vec4;
             static set animSpeed(speed: any);
             setFlexes(flexes?: {}): void;
             resetFlexParameters(): void;
             playDefaultAnim(): Promise<void>;
             getHitboxes(): Hitbox[];
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
             static createInstance(repository: string, fileName: string, dynamic: boolean, preventInit?: boolean): Promise<Source1ModelInstance | null>;
             static loadManifest(repositoryName: string): void;
             static getModelList(): Promise<FileSelectorFile>;
         }

         export declare type Source1ModelSequences = Record<string, {
             frame?: number;
             startTime?: number;
             s?: MdlStudioSeqDesc;
         }>;

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
             static loadManifest(repositoryName: string, fileName: string): void;
             static mute(): void;
             static unmute(): void;
         }

         export declare const Source1TextureManager: Source1TextureManagerClass;

         declare class Source1TextureManagerClass extends EventTarget {
             #private;
             fallbackRepository: string;
             constructor();
             getTexture(repository: string, path: string, needCubeMap?: boolean, srgb?: boolean): AnimatedTexture | null;
             getVtf(repository: string, path: string): Promise<SourceEngineVTF | null>;
             getTextureAsync(repository: string, path: string, frame: number, needCubeMap: boolean, defaultTexture?: Texture, srgb?: boolean): Promise<Texture>;
             getInternalTextureName(): string;
             addInternalTexture(repository: string, texture?: AnimatedTexture): {
                 name: string;
                 texture: AnimatedTexture;
             };
             setTexture(repository: string, path: string, texture: AnimatedTexture): void;
             removeTexture(repository: string, path: string): void;
         }

         export declare const SOURCE2_DEFAULT_RADIUS = 5;

         declare class Source2Animation {
             #private;
             file?: Source2File;
             constructor(animGroup: Source2AnimGroup);
             setFile(sourceFile: Source2File): void;
             setAnimDatas(data: Kv3Element): void;
             getAnimDesc(name: string): Source2AnimationDesc | undefined;
             getDecodeKey(): Kv3Element;
             getDecoderArray(): Source2AnimeDecoder[];
             getSegment(segmentIndex: number): Kv3Element;
             getAnimations(animations?: Set<string>): Promise<Set<string>>;
             getAnimationsByActivity(activityName: string): any[];
             get animArray(): Kv3Element[];
             getAnimationByName(animName: string): Source2AnimationDesc;
         }

         declare class Source2AnimationDesc {
             #private;
             data: Kv3Element;
             constructor(source2Model: Source2Model, data: Kv3Element, animationResource: Source2Animation | Source2SeqGroup);
             get fps(): number;
             get lastFrame(): number;
             getFrame(frameIndex: number): any[];
             matchActivity(activityName: string): boolean;
             modifiersScore(activityName: any, modifiers: any): number;
             matchModifiers(activityName: string, modifiers: Set<string>): boolean;
         }

         declare class Source2Animations {
             #private;
             addAnimations(animations: any): void;
             getAnimations(): any[];
             getAnimation(activityName: any, activityModifiers?: Set<never>): any;
             getBestAnimation(activityName: any, activityModifiers: any): any;
         }

         declare type Source2AnimeDecoder = {
             name: string;
             version: number;
             type: number;
         };

         declare class Source2AnimGroup {
             #private;
             repository: string;
             file: any;
             decoderArray: Source2AnimeDecoder[];
             localAnimArray: any;
             decodeKey?: Kv3Element;
             directHSeqGroup: any;
             loaded: boolean;
             constructor(source2Model: Source2Model, repository: string);
             setFile(sourceFile: Source2File): void;
             setAnimationGroupResourceData(localAnimArray: any, decodeKey: Kv3Element): void;
             getAnim(animIndex: number): any;
             getAnimDesc(name: string): Source2AnimationDesc | undefined;
             matchActivity(activity: string, modifiers: string[]): any;
             getAnims(): Set<Source2Animation>;
             getAnimationsByActivity(activityName: any): any[];
             getDecodeKey(): Kv3Element;
             get source2Model(): Source2Model;
             getAnimationByName(animName: string): Source2AnimationDesc;
             set _changemyname(_changemyname: Source2Animation[]);
             get _changemyname(): Source2Animation[];
         }

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
             setupUniformsOnce(): void;
             getUniforms(): Map<string, string>[];
             getTextureUniforms(): Map<string, [string, string]>[];
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
             blocks: Record<string, Source2FileBlock>;
             blocksArray: Source2FileBlock[];
             fileLength: number;
             versionMaj: number;
             versionMin: number;
             maxBlockOffset: number;
             constructor(repository: string, fileName: string);
             addBlock(block: Source2FileBlock): void;
             getBlockByType(type: string): Source2FileBlock | null;
             getBlockById(id: number): Source2FileBlock | null;
             getVertexCount(bufferId: number): number;
             getIndices(bufferId: number): number[] | null;
             getVertices(bufferId: number): number[] | null;
             getNormals(bufferId: number): number[] | null;
             getCoords(bufferId: number): number[] | null;
             getBoneIndices(bufferId: number): number[] | null;
             getBoneWeight(bufferId: number): number[] | null;
             getBlockStruct(block: string, path: string): Kv3ValueType | undefined;
             getBlockStructAsArray(block: string, path: string): any[] | null;
             getBlockStructAsElement(block: string, path: string): Kv3Element | null;
             getBlockStructAsElementArray(block: string, path: string): Kv3Element[] | null;
             getBlockStructAsString(block: string, path: string): string | null;
             getBlockStructAsStringArray(block: string, path: string): string[] | null;
             getBlockStructAsResourceArray(block: string, path: string): string[] | null;
             getBlockStructAsBigintArray(block: string, path: string): bigint[] | null;
             getBlockStructAsNumberArray(block: string, path: string): number[] | null;
             getBlockKeyValues(block: string): Kv3Element | null;
             getPermModelData(path: string): Kv3ValueType | undefined;
             getMaterialResourceData(path: string): Kv3Element[] | null;
             getExternalFiles(): string[] | null;
             getExternalFile(fileIndex: number): string | null;
             getKeyValue(path: string): any;
             /**
              * @deprecated use getDisplayName() instead
              */
             get displayName(): string;
             getDisplayName(): string;
             getRemappingTable(meshIndex: number): number[] | bigint[] | null;
             remapBuffer(buffer: ArrayBuffer, remappingTable: number[] | bigint[] | null): Float32Array;
         }

         /**
          * Source2 common file block
          */
         declare class Source2FileBlock {
             file: Source2File;
             type: string;
             offset: number;
             length: number;
             indices?: any[];
             vertices?: any[];
             keyValue?: Kv3File;
             constructor(file: Source2File, type: string, offset: number, length: number);
             getKeyValue(path: string): Kv3Element | Kv3Value | undefined | null;
             getKeyValueAsNumber(path: string): number | null;
             getKeyValueAsStringArray(path: string): string[] | null;
             getKeyValueAsElementArray(path: string): Kv3Element[] | null;
             getIndices(bufferId: number): number[];
             getVertices(bufferId: number): number[];
             getNormalsTangents(bufferId: number): any[][];
             getCoords(bufferId: number): number[];
             getNormal(bufferId: number): number[];
             getTangent(bufferId: number): number[];
             getBoneIndices(bufferId: number): ArrayBuffer;
             getBoneWeight(bufferId: number): number[];
         }

         export declare class Source2FileLoader extends SourceBinaryLoader {
             #private;
             vtex: boolean;
             constructor(vtex?: boolean);
             parse(repository: string, path: string, arrayBuffer: ArrayBuffer): Promise<Source2File | Source2Texture>;
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

         export declare class Source2LifespanDecay extends Operator {
             doOperate(particle: Source2Particle, elapsedTime: number, strength: number): void;
         }

         export declare class Source2LockToBone extends Operator {
             #private;
             _paramChanged(paramName: string, param: OperatorParam): void;
             doOperate(particle: Source2Particle | null | Source2Particle[], elapsedTime: number, strength: number): void;
         }

         export declare class Source2Material extends Material {
             #private;
             repository: string;
             constructor(repository: string, source2File?: Source2File);
             setupUniformsOnce(): void;
             setupUniforms(): void;
             clone(): Source2Material;
             getTextureByName(textureName: string): string | null;
             updateMaterial(time: number, mesh: Mesh): void;
             processProxies(time: number, proxyParams: ProxyParams): void;
             _afterProcessProxies(proxyParams: ProxyParams): void;
             setDynamicUniform(uniformName: string): void;
             afterProcessProxies(proxyParams: ProxyParams): void;
             setUniform(uniformName: string, uniformValue: UniformValue): void;
             initFloatUniforms(): void;
             initVectorUniforms(): void;
             getUniforms(): Map<string, string>[];
             getTextureUniforms(): Map<string, [string, string]>[];
             initTextureUniforms(): Promise<void>;
             getParam(paramName: string): number | vec4;
             getIntParam(intName: string): number;
             getFloatParam(floatName: string): number;
             getVectorParam(vectorName: string, out: vec4): vec4;
             getDynamicParam(dynamicName: string): vec4 | undefined;
         }

         export declare class Source2MaterialManager {
             #private;
             static addMaterial(material: Source2Material): void;
             static removeMaterial(material: Source2Material): void;
             static getMaterial(repository: string, path: string): Promise<Source2Material | null>;
         }

         declare class Source2Model {
             #private;
             repository: string;
             vmdl: Source2File;
             requiredLod: number;
             drawBodyPart: {};
             currentSkin: number;
             currentSheen: any;
             animLayers: any[];
             animGroups: Set<Source2AnimGroup>;
             materialRepository: any;
             dirty: boolean;
             geometries: Set<BufferGeometry>;
             bodyParts: Map<string, BodyPart>;
             attachments: Map<string, Source2ModelAttachment>;
             bodyGroups: Set<string>;
             bodyGroupsChoices: Set<BodyGroupChoice>;
             constructor(repository: string, vmdl: Source2File);
             matchActivity(activity: string, modifiers: string[]): any;
             addGeometry(geometry: BufferGeometry, bodyPartName: string, bodyPartModelId: number): void;
             createInstance(isDynamic: boolean): Source2ModelInstance;
             getBones(): Kv3Element | null;
             getSkinMaterials(skin: number): string[] | null;
             getSkinList(): string[];
             loadAnimGroups(): Promise<void>;
             getIncludeModels(): any[];
             addIncludeModel(includeModel: Source2Model): void;
             getAnim(activityName: string, activityModifiers: Set<string>): any;
             getAnimation(name: string): Source2AnimationDesc | undefined;
             getAnimationsByActivity(activityName: string, animations?: Source2Animations): Source2Animations;
             getAnimations(): Promise<Set<string>>;
             _addAttachments(attachments: Kv3Element[]): void;
             getAnimationByName(animName: string): Source2AnimationDesc;
         }

         declare class Source2ModelAttachment {
             name: string;
             ignoreRotation: boolean;
             influenceNames: string[];
             influenceWeights: number[];
             influenceOffsets: vec3[];
             influenceRotations: quat[];
             constructor(name: string);
         }

         declare class Source2ModelAttachmentInstance extends Entity {
             #private;
             model: any;
             attachment: any;
             constructor(model: Source2ModelInstance, attachment: Source2ModelAttachment);
             getWorldPosition(vec?: vec3): vec3;
             getWorldQuaternion(q?: quat): quat;
         }

         export declare class Source2ModelInstance extends Entity implements Animated, HasSkeleton, RandomPointOnModel {
             #private;
             isSource2ModelInstance: boolean;
             animable: boolean;
             bodyParts: {};
             poseParameters: Record<string, number>;
             meshes: Set<Mesh>;
             attachments: Map<string, Source2ModelAttachmentInstance>;
             activity: string;
             activityModifiers: Set<string>;
             sequences: {};
             mainAnimFrame: number;
             animationSpeed: number;
             sourceModel: Source2Model;
             hasAnimations: true;
             constructor(sourceModel: Source2Model, isDynamic: boolean);
             setBodyGroup(name: string, choice: number): void;
             get skeleton(): Skeleton;
             set position(position: vec3);
             get position(): vec3;
             addChild(child: Entity): Entity;
             removeChild(child: Entity): void;
             set skin(skin: number);
             get skin(): number;
             setLOD(lod: number): void;
             setPoseParameter(paramName: string, paramValue: number): void;
             playSequence(activity: string, activityModifiers?: string[]): void;
             playAnimation(name: any): void;
             setAnimation(id: number, name: string, weight: number): Promise<void>;
             setActivityModifiers(activityModifiers?: string[]): void;
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
             getAttachment(name: any): Source2ModelAttachmentInstance;
             static set animSpeed(speed: any);
             dispose(): void;
             static getEntityName(): string;
         }

         export declare class Source2ModelLoader {
             #private;
             load(repository: string, path: string): Promise<Source2Model | null>;
             testProcess2(vmdl: Source2File, model: Source2Model, repository: string): Promise<Entity>;
         }

         export declare class Source2ModelManager {
             #private;
             static instances: Set<never>;
             static createInstance(repository: any, fileName: any, dynamic: any): Promise<any>;
             static loadManifest(repositoryName: any): Promise<void>;
             static getModelList(): Promise<FileSelectorFile>;
         }

         export declare class Source2MovementRotateParticleAroundAxis extends Operator {
             #private;
             _paramChanged(paramName: string, param: OperatorParam): void;
             doOperate(particle: Source2Particle, elapsedTime: number, strength: number): void;
         }

         export declare class Source2OscillateScalar extends Operator {
             #private;
             _paramChanged(paramName: string, param: OperatorParam): void;
             doOperate(particle: Source2Particle, elapsedTime: number, strength: number): void;
         }

         export declare class Source2OscillateVector extends Operator {
             #private;
             _paramChanged(paramName: string, param: OperatorParam): void;
             doOperate(particle: Source2Particle, elapsedTime: number, strength: number): void;
         }

         declare class Source2Particle {
             id: number;
             isAlive: boolean;
             position: vec3;
             quaternion: quat;
             prevPosition: vec3;
             cpPosition: vec3;
             velocity: vec3;
             color: vec4;
             initialColor: vec4;
             normal: vec3;
             scratchVec: vec3;
             scratch: number;
             hitboxOffsetPosition: vec3;
             glowRGB: vec3;
             uMin: number;
             uMax: number;
             vMin: number;
             vMax: number;
             cTime: number;
             context: Map<Operator, any>;
             system: Source2ParticleSystem;
             currentTime: number;
             timeToLive: number;
             initialTimeToLive: number;
             proportionOfLife: number;
             trail: any[];
             modelName: string;
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
             glowAlpha: number;
             sequence: number;
             initialSequence: number;
             sequence2: number;
             frame: number;
             PositionFromParentParticles: boolean;
             posLockedToCP: boolean;
             rotLockedToCP: boolean;
             trailLength: number;
             MovementRigidAttachToCP: boolean;
             previousElapsedTime: number;
             skinning?: Source2ParticleSkinning;
             initialSkinnedPosition?: vec3;
             initialSkinnedNormal?: vec3;
             snapHitbox?: any;
             snapHitboxOffset?: any;
             bones?: any[];
             initialVec?: vec3;
             static consoleAlphaAlternate: boolean;
             static consolePitch: boolean;
             constructor(id: number, system: Source2ParticleSystem);
             step(elapsedTime: number): void;
             start(): void;
             die(): void;
             reset(id: number): void;
             setInitialField(field: number, value: any, mulInitial?: boolean): void;
             setField(field: number, value: any, mulInitial?: boolean, setInitial?: boolean, additive?: boolean): void;
             /**
              * TODO
              */
             getScalarField(field?: number, initial?: boolean): number;
             getVectorField(out: vec3, field?: number, initial?: boolean): vec3;
             /**
              * @deprecated Please use getScalarField instead.
              */
             getField(field?: number, initial?: boolean): number | [number, number, number] | Float32Array<ArrayBufferLike> | [number, number, number, number];
             /**
              * TODO
              */
             setInitialSequence(sequence: number): void;
             /**
              * TODO
              */
             setInitialRadius(radius: number): void;
             /**
              * TODO
              */
             setInitialTTL(timeToLive: number): void;
             /**
              * TODO
              */
             setInitialColor(color: vec4): void;
             /**
              * Set particle initial rotation roll.
              * @param {Number} roll Initial rotation roll.
              */
             setInitialRoll(roll: number): void;
             /**
              * Get particle world position
              * @param {vec3|null} The receiving vector. Created if null.
              * @return {vec3} The world position.
              */
             getWorldPos(worldPos?: vec3): vec3;
             /**
              * Get particle world position
              * @param {vec3|null} The receiving vector. Created if null.
              * @return {vec3} The world position.
              */
             getLocalPos(worldPos?: vec3): vec3;
         }

         export declare const Source2ParticleLoader: {
             load(repository: string, path: string): Promise<Source2File | null>;
             getSystem(repository: string, vpcf: Source2File, snapshotModifiers?: Map<string, string>): Promise<Source2ParticleSystem>;
         };

         export declare const Source2ParticleManager: Source2ParticleManagerClass;

         declare class Source2ParticleManagerClass {
             #private;
             speed: number;
             activeSystemList: Set<Source2ParticleSystem>;
             visible?: boolean;
             constructor();
             getSystem(repository: string, vpcfPath: string, snapshotModifiers?: Map<string, string>): Promise<any>;
             stepSystems(elapsedTime: number): void;
             setActive(system: Source2ParticleSystem): void;
             setInactive(system: Source2ParticleSystem): void;
             renderSystems(render: boolean): void;
             getSystemList(): Promise<FileSelectorFile>;
             loadManifests(...repositories: string[]): Promise<void>;
         }

         export declare class Source2ParticlePathParams {
             bulgeControl: number;
             bulge: number;
             startControlPointNumber: number;
             endControlPointNumber: number;
             midPoint: number;
             startPointOffset: vec3;
             midPointOffset: vec3;
             endOffset: vec3;
             static fromOperatorParam(param: OperatorParam, path: Source2ParticlePathParams): void;
         }

         declare enum Source2ParticleSetMethod {
             SetValue = "PARTICLE_SET_VALUE",
             ScaleInitial = "PARTICLE_SET_SCALE_INITIAL_VALUE",
             AddInitial = "PARTICLE_SET_ADD_TO_INITIAL_VALUE",
             RampCurrent = "PARTICLE_SET_RAMP_CURRENT_VALUE",//Ramp Current Value at Input Rate Per Second
             ScaleCurrent = "PARTICLE_SET_SCALE_CURRENT_VALUE",//Scale Current Value Raw
             AddCurrent = "PARTICLE_SET_ADD_TO_CURRENT_VALUE",
             Default = "PARTICLE_SET_VALUE"
         }

         declare type Source2ParticleSkinning = {
             bones: [string, string, string, string];
             weights: [number, number, number, number];
         };

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
             preEmissionOperators: Operator[];
             emitters: Operator[];
             initializers: Operator[];
             operators: Operator[];
             forces: Operator[];
             constraints: Operator[];
             renderers: Operator[];
             childSystems: Source2ParticleSystem[];
             livingParticles: Source2Particle[];
             poolParticles: Source2Particle[];
             minBounds: vec3;
             maxBounds: vec3;
             particleCount: number;
             initialParticles: number;
             disabled: boolean;
             baseProperties: BaseProperties;
             firstStep: boolean;
             currentTime: number;
             elapsedTime: number;
             previousElapsedTime: number;
             maxParticles: number;
             currentParticles: number;
             resetDelay: number;
             parentSystem: Source2ParticleSystem | null;
             isBounded: boolean;
             endCap: boolean;
             groupId: number;
             constructor(repository: string, fileName: string, name: string);
             init(snapshotModifiers?: Map<string, string>): Promise<void>;
             start(): void;
             stop(): void;
             stopChildren(): void;
             do(action: string, params?: any): void;
             reset(): void;
             step(elapsedTime: number): void;
             createParticle(emitterIndex: number, creationTime: number, elapsedTime: number): Source2Particle;
             getWorldPosition(vec?: vec3): vec3;
             getWorldQuaternion(q?: quat): quat;
             getControlPoint(controlPointId: number): ControlPoint;
             getControlPointForScale(controlPointId: number): ControlPoint;
             getOwnControlPoint(controlPointId: number): ControlPoint;
             getControlPointPosition(cpId: number): vec3;
             setControlPointPosition(cpId: number, position: vec3): void;
             setMaxParticles(max: number): void;
             stepConstraints(particle: Source2Particle): void;
             getBounds(minBounds: vec3, maxBounds: vec3): void;
             getBoundsCenter(center: vec3): void;
             parentChanged(parent: Entity | null): void;
             setParentModel(model?: Entity | undefined): void;
             getParentModel(): Entity | undefined;
             getParticle(index?: number): Source2Particle;
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
             #private;
             _paramChanged(paramName: string, param: OperatorParam): void;
             doForce(particle: Source2Particle, elapsedTime: number, accumulatedForces: vec3, strength: number): void;
         }

         declare class Source2SeqGroup {
             #private;
             sequences: Source2Sequence[];
             file?: Source2File;
             loaded: boolean;
             constructor(animGroup: Source2AnimGroup);
             setFile(sourceFile: Source2File): void;
             getAnimDesc(name: string): Source2AnimationDesc | undefined;
             matchActivity(activity: string, modifiers: string[]): any;
             getAnimationsByActivity(activityName: any): any[];
             getDecodeKey(): Kv3Element;
             getDecoderArray(): Source2AnimeDecoder_2[];
             get localSequenceNameArray(): any;
         }

         declare class Source2Sequence {
             name: string;
             fps: number;
             frameCount: number;
             activities: any;
             animNames: any;
             constructor(name: any, params?: any);
             matchActivity(activity: string, modifiers: string[]): boolean;
         }

         export declare class Source2SetControlPointPositions extends Operator {
             #private;
             _paramChanged(paramName: string, param: OperatorParam): void;
             doOperate(particle: Source2Particle | Source2Particle[] | undefined | null, elapsedTime: number, strength: number): void;
             isPreEmission(): boolean;
         }

         declare class Source2Snapshot {
             particleCount: number;
             attributes: any;
             file: any;
             setParticleCount(particleCount: number): void;
         }

         export declare const Source2SnapshotLoader: {
             load(repository: string, filename: string): Promise<Source2Snapshot>;
             "__#254@#loadSnapshot"(snapFile: Source2File): Source2Snapshot;
         };

         export declare class Source2SpringMeteor extends Source2Material {
             get shaderSource(): string;
         }

         export declare class Source2SpriteCard extends Source2Material {
             #private;
             constructor(repository: string, source2File?: Source2File);
             setOutputBlendMode(outputBlendMode: number): void;
             setTexturePath(texturePath: string): Promise<void>;
             initTextureUniforms(): Promise<void>;
             getFrameSpan(sequence: number): number;
             getShaderSource(): string;
         }

         declare class Source2SpriteSheet {
             sequences: Source2SpriteSheetSequence[];
             addSequence(): Source2SpriteSheetSequence;
             getFrame(sequenceId: number, frame: number): Source2SpriteSheetFrame | null;
         }

         declare class Source2SpriteSheetFrame {
             coords: vec4;
             duration: number;
         }

         declare class Source2SpriteSheetSequence {
             duration: number;
             frames: Source2SpriteSheetFrame[];
             addFrame(): Source2SpriteSheetFrame;
         }

         declare class Source2Texture extends Source2File {
             constructor(repository: string, path: string);
             getAlphaBits(): number;
             getWidth(): number;
             getHeight(): number;
             getDxtLevel(): number;
             isCompressed(): boolean;
             isCubeTexture(): boolean;
             get imageFormat(): number;
         }

         export declare const Source2TextureManager: Source2TextureManagerClass;

         declare class Source2TextureManagerClass extends EventTarget {
             #private;
             WEBGL_compressed_texture_s3tc: any;
             EXT_texture_compression_bptc: any;
             EXT_texture_compression_rgtc: any;
             constructor();
             getTexture(repository: string, path: string, frame: number): Promise<Texture | null>;
             getVtex(repository: string, path: string): Promise<Source2Texture | null>;
             getTextureSheet(repository: string, path: string): Promise<Source2SpriteSheet | null>;
             setTexture(path: string, texture: AnimatedTexture): void;
             fillTexture(imageFormat: number, width: number, height: number, datas: ArrayBufferView | null, target: GLenum): void;
             fillTextureDxt(texture: WebGLTexture, imageFormat: number, width: number, height: number, datas: Uint8Array, target: GLenum): void;
         }

         export declare class Source2TwistAroundAxis extends Operator {
             _paramChanged(paramName: string, param: OperatorParam): void;
             doForce(particle: Source2Particle, elapsedTime: number, accumulatedForces: vec3, strength: number): void;
         }

         export declare class Source2UI extends Source2Material {
             get shaderSource(): string;
         }

         export declare class Source2Unlit extends Source2Material {
             get shaderSource(): string;
         }

         export declare class Source2VelocityRandom extends Operator {
             #private;
             _paramChanged(paramName: string, param: OperatorParam): void;
             doInit(particle: Source2Particle, elapsedTime: number, strength: number): void;
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
             animate2(dynamicProp: Source1ModelInstance, poseParameters: Map<string, number>, position: vec3, orientation: quat, sequences: Source1ModelSequences): void;
         }

         declare class SourceBinaryLoader {
             repository: string;
             load(repositoryName: string, fileName: string): Promise<Source2File | SourceMdl | SourceVvd | SourceVtx | SourceBSP | SourcePCF | SourceEngineVTF | null>;
             parse(repository: string, fileName: string, arrayBuffer: ArrayBuffer): Promise<Source2File | any> | SourceVvd | SourceVtx | SourceEngineVTF | SourcePCF | SourceMdl | SourceBSP | null;
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
             path: string;
             proxyParams: any;
             proxies: Proxy_2[];
             variables: Map<string, any>;
             numFrames: number;
             frameX: number;
             frameY: number;
             sequenceLength: number;
             constructor(params: SourceEngineMaterialParams);
             init(): void;
             getTexture(role: TextureRole, repository: string, path: string, frame: number, needCubeMap?: boolean, srgb?: boolean): Texture;
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
             clone(): SourceEngineMaterial;
             dispose(): void;
         }

         export declare class SourceEngineMaterialManager {
             #private;
             static getMaterial(repository: string, path: string, searchPaths?: string[]): Promise<SourceEngineMaterial | null>;
             static addRepository(repository: string): void;
             static getMaterialList(): Promise<{
                 files: any[];
             }>;
         }

         declare type SourceEngineMaterialParams = MaterialParams_2 & {
             repository: string;
             path: string;
             useSrgb?: boolean;
         };

         export declare class SourceEngineMDLLoader extends SourceBinaryLoader {
             #private;
             load(repository: string, path: string): Promise<SourceMdl | null>;
             parse(repository: string, fileName: string, arrayBuffer: ArrayBuffer): SourceMdl;
             _parseAnimSection(reader: BinaryReader, animDesc: MdlStudioAnimDesc, frameIndex: number): MdlStudioAnim[] | null;
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
             readonly position: vec3;
             readonly prevPosition: vec3;
             readonly cpPosition: vec3;
             readonly cpOrientation: quat;
             readonly cpOrientationInvert: quat;
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
             initialVec?: vec3;
             bones?: [Bone, number][];
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
             particleSystem?: SourceEngineParticleSystem;
             material?: Material;
             materialLoaded: boolean;
             paramList: ParamType[];
             mesh?: Mesh;
             constructor();
             get functionName(): string;
             static get functionName(): string;
             static getFunctionName(): string;
             initializeParticle(particle: SourceEngineParticle, elapsedTime: number): void;
             operateParticle(particle: SourceEngineParticle, elapsedTime: number): void;
             forceParticle(particle: SourceEngineParticle, elapsedTime: number, accumulatedForces?: vec3): void;
             constraintParticle(particle: SourceEngineParticle): void;
             doEmit(elapsedTime: number): void;
             doInit(particle: SourceEngineParticle, elapsedTime: number): void;
             doOperate(particle: SourceEngineParticle, elapsedTime: number): void;
             doForce(particle: SourceEngineParticle, elapsedTime: number, accumulatedForces?: vec3, strength?: number): void;
             applyConstraint(particle: SourceEngineParticle): void;
             doRender(particle: SourceEngineParticle[], elapsedTime: number, material: Material): void;
             initRenderer(particleSystem: SourceEngineParticleSystem): void;
             updateParticles(particleSystem: SourceEngineParticleSystem, particleList: SourceEngineParticle[], elapsedTime: number): void;
             emitParticle(creationTime: number, elapsedTime: number): any;
             setMaterial(material: Material): void;
             setParticleSystem(particleSystem: SourceEngineParticleSystem): void;
             paramChanged(name: string, value: CDmxAttributeValue | CDmxAttributeValue[]): void;
             setParameter(parameter: string, type: string, value: CDmxAttributeValue | CDmxAttributeValue[]): this;
             getParameter(parameter: string): any;
             getParameters(): Record<string, any>;
             setNameId(name: string): void;
             doNothing(): void;
             reset(): void;
             getOperatorFade(): number;
             getOperatorStrength(): number;
             getParamList(): ParamType[];
             addParam(param: string, type: string, value: CDmxAttributeValue): void;
             getInputValue(inputField: number, particle: SourceEngineParticle): any;
             getInputValueAsVector(inputField: number, particle: SourceEngineParticle, v: vec3): void;
             setOutputValue(outputField: number, value: any, particle: SourceEngineParticle): void;
             initMultipleOverride(): boolean;
             finished(): boolean;
             setOrientationType(orientationType: number): void;
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
             paramList: ParamType[];
             parameters: Record<string, {
                 type?: any;
                 value?: string;
             }>;
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
             attachmentBone: any;
             currentOrientation: quat;
             prevOrientation: quat;
             emitters: Record<string, SourceEngineParticleOperator>;
             initializers: Record<string, SourceEngineParticleOperator>;
             operators: Record<string, SourceEngineParticleOperator>;
             forces: Map<string, SourceEngineParticleOperator>;
             constraints: Record<string, SourceEngineParticleOperator>;
             tempChildren: Record<string, string>;
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
             setParameter(parameter: string, type: any, value: any): this;
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
             getControlPoints(): ControlPoint[];
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
             setChildControlPointOrientation(first: number, last: number, orientation: quat): void;
             getParticle(index?: number): SourceEngineParticle;
             getControlPointPosition(cpId: number): vec3;
             setControlPointPosition(cpId: number, position: vec3): void;
             setControlPointParent(controlPointId: number, parentControlPointId: number): void;
             getWorldQuaternion(q?: quat): quat;
             getBoundingBox(boundingBox?: BoundingBox): BoundingBox;
             set autoKill(autoKill: boolean);
             get autoKill(): boolean;
             setLooping(looping: boolean): void;
             getLooping(): boolean;
             dispose(): void;
             getBounds(min?: vec3, max?: vec3): void;
             static setSpeed(speed: number): void;
             static setSimulationSteps(simulationSteps: number): void;
             getChildrenSystems(): SourceEngineParticleSystem[];
             getActiveParticlesCount(): number;
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
             parse(repository: string, path: string, content: ArrayBuffer): SourcePCF | null;
             getString(pcf: SourcePCF, index: number): string;
             getElement(pcf: SourcePCF, index: number): CDmxElement | null;
         }

         export declare const SourceEngineVMTLoader: SourceEngineVMTLoaderClass;

         declare class SourceEngineVMTLoaderClass {
             #private;
             load(repository: string, path: string): Promise<SourceEngineMaterial | null>;
             parse(repository: string, path: string, content: string): Promise<SourceEngineMaterial | null>;
             setMaterial(fileName: any, fileContent: any): void;
             registerMaterial(materialName: any, materialClass: any): void;
         }

         export declare class SourceEngineVTF {
             #private;
             repository: string;
             fileName: string;
             versionMaj: number;
             versionMin: number;
             width: number;
             height: number;
             flags: number;
             frames: number;
             faceCount: number;
             firstFrame: number;
             reflectivity: vec3;
             bumpmapScale: number;
             highResImageFormat: number;
             mipmapCount: number;
             lowResImageFormat: number;
             lowResImageWidth: number;
             lowResImageHeight: number;
             depth: number;
             resEntries: VTFResourceEntry[];
             currentFrame: number;
             numResources: number;
             headerSize: number;
             sheet?: any;
             constructor(repository: string, fileName: string);
             setVerionMin(value: number): void;
             /**
              * TODO
              */
             setFlags(flags: number): void;
             getFlag(flag: number): boolean;
             getAlphaBits(): number;
             /**
              * TODO
              */
             setVerionMaj(value: number): void;
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
             getResource(type: number): VTFResourceEntry | null;
             fillTexture(graphics: Graphics, glContext: WebGLAnyRenderingContext, texture: Texture, mipmapLvl: number, frame1?: number, srgb?: boolean): void;
             getFormat(): number;
             getType(): number;
             /**
              * Return whether the texture is compressed or not
              * @return {bool} true if texture is dxt compressed
              */
             isDxtCompressed(): boolean;
             isSRGB(): boolean;
             getImageData(mipmap?: number, frame?: number, face?: number): Promise<ImageData | null>;
         }

         export declare class SourceEngineVTXLoader extends SourceBinaryLoader {
             #private;
             constructor(mdlVersion: number);
             load(repository: string, path: string): Promise<SourceVtx | null>;
             parse(repository: string, fileName: string, arrayBuffer: ArrayBuffer): SourceVtx;
         }

         export declare class SourceEngineVVDLoader extends SourceBinaryLoader {
             #private;
             load(repository: string, path: string): Promise<SourceVvd | null>;
             parse(repository: string, fileName: string, arrayBuffer: ArrayBuffer): SourceVvd;
         }

         declare class SourceMdl {
             #private;
             repository: string;
             readonly externalMdlsV2: Promise<SourceMdl | null>[];
             readonly attachmentNames: Map<string, MdlAttachment>;
             readonly flexController: FlexController;
             readonly skinReferences: any[][];
             readonly textures: MdlTexture[];
             readonly modelGroups: MdlStudioModelGroup[];
             header: SourceMdlHeader;
             readonly bodyParts: MdlBodyPart[];
             readonly sequences: MdlStudioSeqDesc[];
             readonly texturesDir: string[];
             readonly flexRules: MdlStudioFlexRule[];
             readonly flexControllers: MdlStudioFlexController[];
             boneCount: number;
             readonly bones: MdlBone[];
             readonly boneNames: Map<string, number>;
             numflexdesc: number;
             readonly attachments: MdlAttachment[];
             readonly animDesc: MdlStudioAnimDesc[];
             loader: SourceEngineMDLLoader;
             reader: BinaryReader;
             readonly poseParameters: MdlStudioPoseParam[];
             readonly hitboxSets: MdlStudioHitboxSet[];
             boneOffset: number;
             boneControllerCount: number;
             boneControllerOffset: number;
             hitboxCount: number;
             hitboxOffset: number;
             localAnimCount: number;
             localAnimOffset: number;
             localSeqCount: number;
             localSeqOffset: number;
             numFlexRules: number;
             flexRulesIndex: number;
             textureCount: number;
             textureOffset: number;
             textureDirCount: number;
             textureDirOffset: number;
             skinReferenceCount: number;
             skinFamilyCount: number;
             skinReferenceOffset: number;
             bodyPartCount: number;
             bodyPartOffset: number;
             attachmentCount: number;
             attachmentOffset: number;
             localNodeCount: number;
             localNodeIndex: number;
             localNodeNameIndex: number;
             flexDescIndex: number;
             flexControllerCount: number;
             flexControllerIndex: number;
             ikChainCount: number;
             ikChainIndex: number;
             mouthsCount: number;
             mouthsIndex: number;
             localPoseParamCount: number;
             localPoseParamOffset: number;
             surfacePropIndex: number;
             keyValueIndex: number;
             keyValueCount: number;
             ikLockCount: number;
             ikLockIndex: number;
             includeModelCount: number;
             includeModelOffset: number;
             animBlocksNameIndex: number;
             boneTableByNameIndex: number;
             vertexBase: number;
             offsetBase: number;
             flexControllerUICount: number;
             flexControllerUIIndex: number;
             studiohdr2index: number;
             srcbonetransform_count: number;
             srcbonetransform_index: number;
             illumpositionattachmentindex: number;
             flMaxEyeDeflection: number;
             linearboneOffset: number;
             constructor(repository: string);
             getMaterialName(skinId: number, materialId: number): string;
             getSkinList(): number[];
             getBodyPart(bodyPartId: number): MdlBodyPart | undefined;
             getBodyParts(): MdlBodyPart[];
             getSequence(sequenceName: string): Promise<MdlStudioSeqDesc | null>;
             getModelGroups(): MdlStudioModelGroup[];
             getExternalMdlCount(): number;
             getExternalMdl(externalId: number): Promise<SourceMdl | null>;
             getTextureDir(): string[];
             getDimensions(out?: vec3): vec3;
             getBBoxMin(out?: vec3): vec3;
             getBBoxMax(out?: vec3): vec3;
             getAnimList(): Promise<Set<string>>;
             getFlexRules(): MdlStudioFlexRule[];
             getFlexControllers(): MdlStudioFlexController[];
             runFlexesRules(flexesWeight: FlexWeight, g_flexdescweight: Float32Array): void;
             addExternalMdl(mdlName: string): void;
             getBoneCount(): number;
             getBones(): MdlBone[];
             getBone(boneIndex: number): MdlBone | undefined;
             getBoneByName(boneName: string): MdlBone | undefined;
             getBoneId(boneName: string): number;
             getAttachments(): MdlAttachment[];
             getAttachmentsNames(out?: string[]): MdlAttachment[];
             getAttachmentById(attachmentId: number): MdlAttachment | undefined;
             getAttachment(attachmentName: string): MdlAttachment | undefined;
             getSequenceById(sequenceId: number): MdlStudioSeqDesc | undefined;
             getSequences(): string[];
             getSequences2(): string[];
             getAnimDescription(animIndex: number): MdlStudioAnimDesc | null;
             getAnimFrame(dynamicProp: Source1ModelInstance, animDesc: MdlStudioAnimDesc, frameIndex: number): {
                 bones: Record<string, any>;
             };
             getLocalPoseParameter(poseIndex: number): MdlStudioPoseParam | undefined;
             getPoseParameters(): MdlStudioPoseParam[];
             boneFlags(boneIndex: number): number;
         }

         declare type SourceMdlHeader = {
             modelFormatID: number;
             formatVersionID: number;
             checkSum: number;
             modelName: string;
             dataLength: number;
             eyeposition: vec3;
             illumposition: vec3;
             hull_min: vec3;
             hull_max: vec3;
             view_bbmin: vec3;
             view_bbmax: vec3;
             flags: number;
             activitylistversion: number;
             eventsindexed: number;
             numFlexDesc: number;
             mass: number;
             contents: number;
             virtualModel: number;
             animBlocksCount: number;
             animBlocksIndex: number;
             animBlockModel: number;
             directionaldotproduct: number;
             rootLod: number;
             numAllowedRootLods: number;
         };

         export declare class SourceModel {
             repository: string;
             fileName: string;
             name: string;
             mdl: SourceMdl;
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
             constructor(repository: string, fileName: string, mdl: SourceMdl, vvd: SourceVvd, vtx: SourceVtx);
             addGeometry(mesh: MeshTest, geometry: BufferGeometry, bodyPartName: string, bodyPartModelId: number): void;
             createInstance(isDynamic: boolean, preventInit: boolean): Source1ModelInstance;
             getBodyNumber(bodygroups: Map<string, number>): number;
             getBones(): MdlBone[] | null;
             getAttachments(): MdlAttachment[] | null;
             getBone(boneIndex: number): MdlBone | undefined;
             getAttachmentById(attachmentIndex: number): MdlAttachment | undefined;
             getBoneByName(boneName: string): MdlBone | undefined;
             getAttachment(attachmentName: string): MdlAttachment | undefined;
             getBodyPart(bodyPartId: number): MdlBodyPart | undefined;
             getBodyParts(): MdlBodyPart[] | undefined;
             getAnimation(animationName: string, entity: Source1ModelInstance): Promise<Animation_2>;
         }

         declare class SourceModelMesh {
             mesh: MeshTest;
             geometry: BufferGeometry;
             constructor(mesh: MeshTest, geometry: BufferGeometry);
         }

         export declare class SourcePCF {
             repository: string;
             path: string;
             stringDict: string[];
             elementsDict: CDmxElement[];
             systems: Record<string, CDmxElement>;
             systems2: Record<string, CDmxElement>;
             binaryVersion: number;
             constructor(repository: string, path: string);
             getSystemElement(systemName: string): CDmxElement | undefined;
             addSystem(element: CDmxElement): void;
             getSystem(systemName: string): SourceEngineParticleSystem | null;
             initSystem(system: SourceEngineParticleSystem): SourceEngineParticleSystem | null;
             addOperators(system: SourceEngineParticleSystem, list: CDmxAttributeValue[], listType: string): void;
             addAttributes(operator: SourceEngineParticleOperator, list: CDmxAttribute[]): void;
         }

         declare class SourceVtx {
             bodyparts: VTXBodyPart[];
             version: number;
             vertCacheSize: number;
             maxBonesPerStrip: number;
             maxBonesPerFace: number;
             maxBonesPerVert: number;
             checkSum: number;
             numLODs: number;
             materialReplacementListOffset: number;
             numBodyParts: number;
             bodyPartOffset: number;
             getBodyparts(): VTXBodyPart[];
         }

         declare class SourceVvd {
             vertices: SourceVvdVertex[];
             numFixups: number;
             fixups: SourceVvdFixup[];
             modelFormatID: number;
             formatVersionID: number;
             checkSum: number;
             numLODs: number;
             numLODVertexes: number[];
             fixupTableStart: number;
             vertexDataStart: number;
             tangentDataStart: number;
             getVertices(lodLevel: number): SourceVvdVertex[] | null;
         }

         declare class SourceVvdBoneWeight {
             weight: number[];
             bone: number[];
             numbones: number;
         }

         /**
          * VVD Model
          */
         declare class SourceVvdFixup {
             lod: number;
             sourceVertexID: number;
             numVertexes: number;
         }

         declare class SourceVvdVertex {
             m_BoneWeights: SourceVvdBoneWeight;
             m_vecPosition: vec3;
             m_vecNormal: vec3;
             m_vecTexCoord: vec2;
             m_vecTangent: vec4;
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
             setRadius(radius: number): void;
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
             #private;
             _paramChanged(paramName: string, param: OperatorParam): void;
             doOperate(particle: Source2Particle, elapsedTime: number, strength: number): void;
         }

         export declare class SpinUpdate extends Operator {
             doOperate(particle: Source2Particle, elapsedTime: number, strength: number): void;
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
             #private;
             constructor(params: SourceEngineMaterialParams);
             init(): void;
             clone(): SpriteCardMaterial;
             get shaderSource(): string;
         }

         export declare class SpriteMaterial extends SourceEngineMaterial {
             #private;
             constructor(params?: any);
             init(): void;
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

         export declare const TEXTUREFLAGS_ALL_MIPS = 1024;

         export declare const TEXTUREFLAGS_ANISOTROPIC = 16;

         export declare const TEXTUREFLAGS_BORDER = 536870912;

         export declare const TEXTUREFLAGS_CLAMPS = 4;

         export declare const TEXTUREFLAGS_CLAMPT = 8;

         export declare const TEXTUREFLAGS_CLAMPU = 33554432;

         export declare const TEXTUREFLAGS_DEPTHRENDERTARGET = 65536;

         export declare const TEXTUREFLAGS_EIGHTBITALPHA = 8192;

         export declare const TEXTUREFLAGS_ENVMAP = 16384;

         export declare const TEXTUREFLAGS_HINT_DXT5 = 32;

         export declare const TEXTUREFLAGS_NODEBUGOVERRIDE = 131072;

         export declare const TEXTUREFLAGS_NODEPTHBUFFER = 8388608;

         export declare const TEXTUREFLAGS_NOLOD = 512;

         export declare const TEXTUREFLAGS_NOMIP = 256;

         export declare const TEXTUREFLAGS_NORMAL = 128;

         export declare const TEXTUREFLAGS_ONEBITALPHA = 4096;

         export declare const TEXTUREFLAGS_POINTSAMPLE = 1;

         export declare const TEXTUREFLAGS_PROCEDURAL = 2048;

         export declare const TEXTUREFLAGS_RENDERTARGET = 32768;

         export declare const TEXTUREFLAGS_SINGLECOPY = 262144;

         export declare const TEXTUREFLAGS_SRGB = 64;

         export declare const TEXTUREFLAGS_SSBUMP = 134217728;

         export declare const TEXTUREFLAGS_TRILINEAR = 2;

         export declare const TEXTUREFLAGS_UNUSED_01000000 = 16777216;

         export declare const TEXTUREFLAGS_UNUSED_40000000 = 1073741824;

         export declare const TEXTUREFLAGS_UNUSED_80000000 = 2147483648;

         export declare const TEXTUREFLAGS_VERTEXTEXTURE = 67108864;

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

         declare enum TextureRole {
             Color = 0,
             Color2 = 0,
             Normal = 1,
             LightWarp = 2,
             PhongExponent = 3,
             SelfIllumMask = 4,
             Env = 5,
             Detail = 6,
             SheenMask = 7,
             Sheen = 8,
             Mask = 9,
             Mask2 = 10,
             Iris = 11,
             Cornea = 12,
             Pattern = 13,
             Ao = 14,
             Wear = 15,
             Grunge = 16,
             Exponent = 17,
             Surface = 18,
             Pos = 19,
             BlendModulate = 20,
             Holo = 21,
             HoloSpectrum = 22,
             Scratches = 23
         }

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
             p: [vec3, vec3, vec3];
         }

         export declare class Triangles extends Mesh {
             #private;
             constructor(params?: any);
             updateGeometry(): void;
         }

         declare type Tuple<T, N extends number, R extends readonly T[] = []> = R['length'] extends N ? R : Tuple<T, N, [T, ...R]>;

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

         declare type UniformValue = boolean | number | number[] | vec2 | vec3 | vec4 | Texture | Texture[] | null;

         export declare class UnlitGenericMaterial extends SourceEngineMaterial {
             #private;
             diffuseModulation: vec4;
             constructor(params?: any);
             init(): void;
             clone(): UnlitGenericMaterial;
             get shaderSource(): string;
         }

         export declare class UnlitTwoTextureMaterial extends SourceEngineMaterial {
             #private;
             init(): void;
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
             constructor(system: Source2ParticleSystem);
             _paramChanged(paramName: string, param: OperatorParam): void;
             doOperate(particle: Source2Particle, elapsedTime: number, strength: number): void;
         }

         export declare class VelocityNoise extends SourceEngineParticleOperator {
             #private;
             static functionName: string;
             constructor();
             doInit(particle: SourceEngineParticle, elapsedTime: number): void;
             initMultipleOverride(): boolean;
         }

         export declare class VelocityRandom extends SourceEngineParticleOperator {
             static functionName: string;
             constructor();
             doInit(particle: any, elapsedTime: any): void;
             initMultipleOverride(): boolean;
         }

         export declare class VertexLitGenericMaterial extends SourceEngineMaterial {
             #private;
             diffuseModulation: vec4;
             constructor(params?: any);
             init(): void;
             afterProcessProxies(proxyParams: any): void;
             clone(): VertexLitGenericMaterial;
             get shaderSource(): string;
         }

         export declare class VpkRepository implements Repository {
             #private;
             active: boolean;
             constructor(name: string, files: File[]);
             get name(): string;
             getFile(filename: string): Promise<RepositoryFileResponse>;
             getFileAsArrayBuffer(filename: string): Promise<RepositoryArrayBufferResponse>;
             getFileAsText(filename: string): Promise<RepositoryTextResponse>;
             getFileAsBlob(filename: string): Promise<RepositoryBlobResponse>;
             getFileAsJson(filename: string): Promise<RepositoryJsonResponse>;
             getFileList(): Promise<RepositoryFileListResponse>;
         }

         declare interface VTFMipMap {
             height: number;
             width: number;
             frames: (Uint8Array | Float32Array)[][];
         }

         declare interface VTFResourceEntry {
             type: number;
             resData: number;
             mipMaps?: VTFMipMap[];
         }

         /**
          * VTX Model
          */
         declare class VTXBodyPart {
             models: VTXModel[];
             numModels: number;
         }

         declare class VTXLod {
             meshes: VTXMesh[];
             numMeshes: number;
             switchPoint: number;
         }

         declare class VTXMesh {
             stripGroups: VTXStripGroupHeader[];
             numStripGroups: number;
         }

         declare class VTXModel {
             lods: VTXLod[];
             numLODs: number;
         }

         declare class VTXStripGroupHeader {
             vertices: MdlVertex[];
             indexes: number[];
             strips: MdlStripHeader[];
             numVerts: number;
             numIndices: number;
             numStrips: number;
             flags: number;
         }

         export declare class WaterLod extends Proxy_2 {
         }

         export declare class WaterMaterial extends SourceEngineMaterial {
             #private;
             init(): void;
             clone(): WaterMaterial;
             getShaderSource(): string;
         }

         export declare class WeaponDecalMaterial extends SourceEngineMaterial {
             #private;
             constructor(params?: any);
             init(): void;
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
             getInclude(includeName: string, compileRow?: number, recursion?: Set<string>, allIncludes?: Set<string>): string[] | undefined | null;
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
             active: boolean;
             constructor(name: string, base: string);
             get name(): string;
             get base(): string;
             getFile(fileName: string): Promise<RepositoryFileResponse>;
             getFileAsArrayBuffer(fileName: string): Promise<RepositoryArrayBufferResponse>;
             getFileAsText(fileName: string): Promise<RepositoryTextResponse>;
             getFileAsBlob(fileName: string): Promise<RepositoryBlobResponse>;
             getFileAsJson(fileName: string): Promise<RepositoryJsonResponse>;
             getFileList(): Promise<RepositoryFileListResponse>;
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
             #private;
             init(): void;
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
             active: boolean;
             constructor(name: string, zip: File);
             get name(): string;
             getFile(filename: string): Promise<RepositoryFileResponse>;
             getFileAsArrayBuffer(filename: string): Promise<RepositoryArrayBufferResponse>;
             getFileAsText(filename: string): Promise<RepositoryTextResponse>;
             getFileAsBlob(filename: string): Promise<RepositoryBlobResponse>;
             getFileAsJson(filename: string): Promise<RepositoryJsonResponse>;
             getFileList(): Promise<RepositoryFileListResponse>;
         }

         export declare const Zstd: {
             "__#223@#webAssembly"?: any;
             "__#223@#HEAPU8"?: Uint8Array;
             decompress(compressedDatas: Uint8Array): Promise<Uint8Array<ArrayBuffer>>;
             decompress_ZSTD(compressedDatas: Uint8Array, uncompressedDatas: Uint8Array): Promise<any>;
             getWebAssembly(): Promise<any>;
             "__#223@#initHeap"(): void;
         };

         export { }
