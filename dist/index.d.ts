import { BinaryReader } from 'harmony-binary-reader';
import { HarmonyMenuItems } from 'harmony-ui';
import { mat2 } from 'gl-matrix';
import { mat3 } from 'gl-matrix';
import { mat4 } from 'gl-matrix';
import { MyEventTarget } from 'harmony-utils';
import { quat } from 'gl-matrix';
import { Shape } from './shape';
import { Source1ModelInstance as Source1ModelInstance_2 } from '../export';
import { Source2AnimeDecoder as Source2AnimeDecoder_2 } from '../models/source2animgroup';
import { Source2Particle as Source2Particle_2 } from '../../source2particle';
import { StaticEventTarget } from 'harmony-utils';
import { Texture as Texture_2 } from '../..';
import { Texture as Texture_3 } from '../../../../..';
import { vec2 } from 'gl-matrix';
import { vec3 } from 'gl-matrix';
import { vec4 } from 'gl-matrix';

declare class Actor {
    #private;
    name: string;
    channels: Channel[];
    active: boolean;
    constructor(choreography: Choreography, name: string);
    addChannel(channel: Channel): void;
    getCharacter(): Source1ModelInstance_2 | undefined;
    setActive(active: boolean): void;
    toString(indent: string): string;
    step(previousTime: number, currentTime: number): void;
    toTimelineElement(): TimelineElement;
}

/**
 * Add proxy. Copies the value of a variable to another.
 * @comment input variable name: srcvar1
 * @comment input variable name: srcvar2
 * @comment ouput variable name: resultVar
 */
export declare class Add extends Proxy_2 {
    execute(variables: Map<string, Source1MaterialVariables>, proxyParams: DynamicParams, time: number): void;
}

declare interface AddCanvasOptions {
    /** Canvas name. Default to an empty string. */
    name?: string;
    /** Set the canvas state to enabled. A disabled canvas will not render. Default to true. */
    enabled?: boolean;
    /** Auto resize the canvas to fit its parent. Default to false. */
    autoResize?: boolean;
    /** Add a single scene to the canvas. A scene can be part of several canvases. If scenes is provided, this property will be ignored. */
    scene?: Scene;
    /** Add several scenes to the canvas. */
    scenes?: CanvasScene[];
}

export declare function addIncludeSource(name: string, source?: string): void;

export declare class AgeNoise extends Operator {
    #private;
    _paramChanged(paramName: string, param: OperatorParam): void;
    doInit(particle: Source2Particle, elapsedTime: number, strength: number): void;
}

export declare class AlphaFadeAndDecay extends Source1ParticleOperator {
    static functionName: string;
    constructor(system: Source1ParticleSystem);
    doOperate(particle: Source1Particle, elapsedTime: number): void;
}

export declare class AlphaFadeInRandom extends Source1ParticleOperator {
    static functionName: string;
    constructor(system: Source1ParticleSystem);
    doOperate(particle: Source1Particle, elapsedTime: number): void;
}

export declare class AlphaFadeOutRandom extends Source1ParticleOperator {
    static functionName: string;
    constructor(system: Source1ParticleSystem);
    doOperate(particle: Source1Particle, elapsedTime: number): void;
}

export declare class AlphaRandom extends Source1ParticleOperator {
    static functionName: string;
    constructor(system: Source1ParticleSystem);
    doInit(particle: Source1Particle, elapsedTime: number): void;
}

export declare class AmbientLight extends Light {
    isAmbientLight: boolean;
    constructor(params?: AmbientLightParameters);
    static constructFromJSON(json: any): Promise<AmbientLight>;
    static getEntityName(): string;
    is(s: string): boolean;
}

declare type AmbientLightParameters = LightParameters;

export declare interface Animated {
    hasAnimations: true;
    getAnimations: () => Promise<Set<string>>;
    playSequence: (name: string) => void;
    playAnimation: (name: string) => void;
    setAnimation: (id: number, name: string, weight: number) => void;
}

declare class AnimatedTexture extends Texture {
    frames: Texture[];
    addFrame(frame: number, texture: Texture): void;
    getFrame(frame: number): Texture | undefined;
    hasOnlyUser(user: any): boolean;
    dispose(): void;
}

export declare class AnimatedTextureProxy extends Proxy_2 {
    #private;
    init(): void;
    execute(variables: Map<string, Source1MaterialVariables>, proxyParams: DynamicParams, time: number): void;
}

export declare class AnimatedWeaponSheen extends Proxy_2 {
    #private;
    init(): void;
    execute(variables: Map<string, Source1MaterialVariables>, proxyParams: DynamicParams, time: number): void;
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
    inputTexture: Texture | null;
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

export declare type AttributeChangedEventData = PropertyChangedEventData;

export declare class AudioGroup {
    #private;
    name: string;
    groups: Map<string, AudioGroup>;
    audioList: Set<HTMLMediaElement>;
    constructor(name: string);
    mute(mute: boolean): void;
    isMute(): boolean;
    getGroup(groupPath: string[]): AudioGroup | null;
    createSubGroup(name: string): AudioGroup;
    playAudio(audio: HTMLMediaElement): Promise<void>;
}

export declare class AudioMixer {
    static master: AudioGroup;
    static muteGroup(groupName: string, mute?: boolean): void;
    static mute(mute?: boolean): void;
    static getGroup(groupName?: string): AudioGroup | null;
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
    set segments(segments: BeamSegment[]);
}

export declare class BeamSegment {
    readonly pos: vec3;
    readonly normal: vec3;
    readonly color: vec4;
    texCoordY: number;
    width: number;
    constructor(pos: vec3, color?: vec4, texCoordY?: number, width?: number);
    distanceTo(other: BeamSegment): number;
}

export declare class BenefactorLevel extends Proxy_2 {
    #private;
    init(): void;
    execute(variables: Map<string, Source1MaterialVariables>, proxyParams: DynamicParams, time: number): void;
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
    set parent(parent: Entity | null);
    get parent(): Entity | null;
    set skeleton(skeleton: Skeleton);
    get skeleton(): Skeleton;
    set parentSkeletonBone(parentSkeletonBone: Bone | null);
    get parentSkeletonBone(): Bone | null;
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
        entitynull_1: null;
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
        entitynull_2: null;
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
        entitynull_3: null;
        scale: {
            i18n: string;
            f: () => void;
        };
        reset_scale: {
            i18n: string;
            f: () => vec3;
        };
        entitynull_4: null;
        wireframe: {
            i18n: string;
            selected: boolean;
            f: () => void;
        };
        cast_shadows: {
            i18n: string;
            selected: boolean | undefined;
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
        Bone_1: null;
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
    constructor(params?: BoxParameters);
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
        entitynull_1: null;
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
        entitynull_2: null;
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
        entitynull_3: null;
        scale: {
            i18n: string;
            f: () => void;
        };
        reset_scale: {
            i18n: string;
            f: () => vec3;
        };
        entitynull_4: null;
        wireframe: {
            i18n: string;
            selected: boolean;
            f: () => void;
        };
        cast_shadows: {
            i18n: string;
            selected: boolean | undefined;
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
        Box_1: null;
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
    static constructFromJSON(json: JSONObject, entities: Map<string, Entity | Material>, loadedPromise: Promise<void>): Promise<Box | null>;
    static getEntityName(): string;
    setSize(width: number, height: number, depth: number): void;
    setSizeVec(size: vec3): void;
    setWidth(width: number): void;
    setHeight(height: number): void;
    setDepth(depth: number): void;
}

declare type BoxParameters = MeshParameters & {
    width?: number;
    height?: number;
    depth?: number;
    widthSegments?: number;
    heightSegments?: number;
    depthSegments?: number;
    material?: Material;
};

export declare class BufferAttribute {
    #private;
    itemSize: number;
    dirty: boolean;
    _array: typeof TypedArrayProto;
    count: number;
    _buffer: WebGLBuffer | null;
    divisor: number;
    constructor(array: typeof TypedArrayProto, itemSize: number);
    get type(): number;
    set usage(usage: BufferUsage);
    set target(target: GLenum);
    set array(array: typeof TypedArrayProto);
    setArray(array: typeof TypedArrayProto): void;
    update(glContext: WebGLAnyRenderingContext): void;
    updateWireframe(glContext: WebGLAnyRenderingContext): void;
    clone(): BufferAttribute;
    setSource(source: any): void;
    getBuffer(): WebGLBuffer | null;
}

export declare class BufferGeometry {
    #private;
    attributes: Map<string, BufferAttribute>;
    dirty: boolean;
    count: number;
    readonly properties: Properties;
    getAttribute(name: string): BufferAttribute | undefined;
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
    init(): void;
    execute(variables: Map<string, Source1MaterialVariables>, proxyParams: DynamicParams, time: number): void;
}

/**
 * BurnLevel proxy.
 * @comment ouput variable name: resultVar
 */
export declare class BurnLevel extends Proxy_2 {
    #private;
    init(): void;
    execute(variables: Map<string, Source1MaterialVariables>, proxyParams: DynamicParams, time: number): void;
}

export declare class Camera extends Entity {
    #private;
    isPerspective: boolean;
    isOrthographic: boolean;
    autoResize: boolean;
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
        entitynull_1: null;
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
        entitynull_2: null;
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
        entitynull_3: null;
        scale: {
            i18n: string;
            f: () => void;
        };
        reset_scale: {
            i18n: string;
            f: () => vec3;
        };
        entitynull_4: null;
        wireframe: {
            i18n: string;
            selected: boolean;
            f: () => void;
        };
        cast_shadows: {
            i18n: string;
            selected: boolean | undefined;
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
        camera1: null;
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
    constructor(params?: MeshParameters);
    update(): void;
    parentChanged(parent: Entity): void;
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
    autoResize?: boolean;
};

export declare enum CameraProjection {
    Perspective = 0,
    Orthographic = 1,
    Mixed = 2
}

declare type CanvasScene = {
    scene: Scene;
    viewport: Viewport;
};

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

export declare type CDmxAttributeValue = null | undefined | boolean | number | CDmxElement | ParticleColor | vec2 | vec3 | vec4 | string;

export declare class CDmxElement {
    type: string;
    name: string;
    guid: Uint8Array;
    guid2: string;
    attributes: CDmxAttribute[];
    inlineSubElements(): Map<CDmxElement, boolean>;
}

export declare function ceilPowerOfTwo(n: number): number;

declare class Channel {
    active: boolean;
    events: ChoreographyEvent[];
    name: string;
    actor?: Actor;
    constructor(name: string);
    /**
     * Add an event
     * @param {Object ChoreographyEvent} event The event to add
         */
     addEvent(event: ChoreographyEvent): void;
     /**
      * TODO
      */
     setActor(actor: Actor): void;
     /**
      * TODO
      */
     getActor(): Actor | undefined;
     /**
      * Set active
      * @param {Bool} active active
      */
     setActive(active: boolean): void;
     /**
      * toString
      */
     toString(indent?: string): string;
     /**
      * Step
      */
     step(previousTime: number, currentTime: number): void;
     toTimelineElement(): TimelineElement;
    }

    export declare class CharacterMaterial extends Source1Material {
        #private;
        constructor(repository: string, path: string, vmt: Source1MaterialVmt, params?: Source1MaterialParams);
        afterProcessProxies(proxyParams?: DynamicParams): void;
        clone(): CharacterMaterial;
        get shaderSource(): string;
    }

    export declare interface ChildAddedEventData {
        child: Entity;
        parent: Entity | null;
    }

    export declare type ChildRemovedEventData = ChildAddedEventData;

    export declare class ChoreographiesManager {
        #private;
        constructor();
        init(repositoryName: string, fileName: string): Promise<void>;
        playChoreography(choreoName: string, actors: Source1ModelInstance[]): Promise<Choreography | null>;
        getChoreography(choreoName: string): Promise<Choreography | null>;
        step(elapsed: number): void;
        reset(): void;
        stopAll(): void;
        play(): void;
        pause(): void;
        setPlaybackSpeed(playbackSpeed: number): void;
        /**
         * @deprecated Please use `setPlaybackSpeed` instead.
         */
        set playbackSpeed(playbackSpeed: number);
    }

    declare class Choreography extends MyEventTarget<ChoreographyEventType> {
        #private;
        actors2: Source1ModelInstance[];
        previousTime: number;
        currentTime: number;
        animsSpeed: number;
        shouldLoop: boolean;
        sceneLength: number;
        constructor(repository: string);
        getRepository(): string;
        /**
         * Add an event
         * @param {Object ChoreographyEvent} event The event to add
             */
         addEvent(event: ChoreographyEvent): void;
         /**
          * Add an actor
          * @param {Object ChoreographyActor} actor The actor to add
              */
          addActor(actor: Actor): void;
          /**
           * toString
           */
          toString(indent?: string): string;
          /**
           * Step
           */
          step(delta: number): boolean;
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
          loop(startTime: number): void;
          /**
           * Step
           */
          setActors(actors: Source1ModelInstance[]): void;
          toTimelineElement(): TimelineElement;
         }

         declare class ChoreographyEvent {
             #private;
             type: number;
             name: string;
             startTime: number;
             endTime: number;
             param1: ChoreographyEventParam;
             param2: ChoreographyEventParam;
             param3: ChoreographyEventParam;
             flags: number;
             distanceToTarget: number;
             flexAnimTracks: any;
             m_nNumLoops: number;
             constructor(choreography: Choreography, repository: string, eventType: number, name: string, startTime: number, endTime: number, param1: ChoreographyEventParam, param2: ChoreographyEventParam, param3: ChoreographyEventParam, flags: number, distanceToTarget: number);
             getRepository(): string;
             /**
              * Get the startTime
              * @return {Number} startTime
              */
             getStartTime(): number;
             /**
              * Get the endTime
              * @return {Number} endTime
              */
             getEndTime(): number;
             /**
              * Get the type
              * @return {Number} The loaded file
              */
             getType(): number;
             /**
              * Set the ramp
              * @param {Object CurveData} ramp The ramp to set
                  */
              setRamp(ramp: CurveData): void;
              /**
               * TODO
               */
              setCloseCaptionType(ccType: number): void;
              /**
               * TODO
               */
              setCloseCaptionToken(token: string): void;
              /**
               * TODO
               */
              setChannel(channel: Channel): void;
              AddRelativeTag(): void;
              addRelativeTag(): void;
              addTimingTag(): void;
              addAbsoluteTag(): void;
              /**
               * TODO
               */
              isResumeCondition(): boolean;
              /**
               * TODO
               */
              isLockBodyFacing(): boolean;
              /**
               * TODO
               */
              isFixedLength(): boolean;
              /**
               * TODO
               */
              isActive(): boolean;
              /**
               * TODO
               */
              getForceShortMovement(): boolean;
              /**
               * TODO
               */
              getPlayOverScript(): boolean;
              /**
               * TODO
               * Add a flex animation track
               */
              addTrack(controllerName: string): FlexAnimationTrack;
              /**
               * toString
               */
              toString(indent: string): string;
              /**
               * Step
               */
              step(previousTime: number, currentTime: number): void;
              /**
               * TODO
               */
              getActor(): Source1ModelInstance_2 | undefined;
              toTimelineElement(): TimelineClip;
             }

             declare type ChoreographyEventParam = any;

             export declare enum ChoreographyEventType {
                 Stop = "stop"
             }

             export declare class Circle extends LineSegments {
                 #private;
                 constructor(params?: any);
                 toJSON(): any;
                 static constructFromJSON(json: JSONObject, entities: Map<string, Entity | Material>, loadedPromise: Promise<void>): Promise<Circle | null>;
                 static getEntityName(): string;
             }

             export declare class Clamp extends Proxy_2 {
                 #private;
                 init(): void;
                 execute(variables: Map<string, Source1MaterialVariables>, proxyParams: DynamicParams, time: number): void;
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
                 constructor(clearColor: vec4, clearDepth: GLclampf, clearStencil: GLint);
                 set clearColor(clearColor: vec4);
                 set clearDepth(clearDepth: GLclampf);
                 set clearStencil(clearStencil: GLint);
                 render(readBuffer: RenderTarget, writeBuffer: RenderTarget, renderToScreen: boolean, delta: number, context: RenderContext): void;
             }

             export declare const COLLISION_GROUP_DEBRIS = 1;

             export declare const COLLISION_GROUP_NONE = 0;

             export declare class CollisionViaTraces extends Source1ParticleOperator {
                 #private;
                 static functionName: string;
                 constructor(system: Source1ParticleSystem);
                 paramChanged(name: string, value: CDmxAttributeValue | CDmxAttributeValue[]): void;
                 applyConstraint(particle: Source1Particle): void;
             }

             export declare class Color {
                 r: number;
                 g: number;
                 b: number;
                 a: number;
                 constructor(r?: number, g?: number, b?: number, a?: number);
             }

             export declare class ColorBackground extends BackGround {
                 #private;
                 constructor(params?: ColorBackgroundParameters);
                 render(renderer: Renderer, camera: Camera): void;
                 setColor(color: vec4): void;
                 getColor(out?: vec4): void;
                 dispose(): void;
                 is(s: string): boolean;
             }

             declare interface ColorBackgroundParameters {
                 color?: vec4;
             }

             export declare class ColorFade extends Source1ParticleOperator {
                 static functionName: string;
                 constructor(system: Source1ParticleSystem);
                 doOperate(particle: Source1Particle, elapsedTime: number): void;
             }

             export declare class ColorInterpolate extends Operator {
                 #private;
                 constructor(system: Source2ParticleSystem);
                 _paramChanged(paramName: string, param: OperatorParam): void;
                 doOperate(particle: Source2Particle, elapsedTime: number, strength: number): void;
             }

             export declare class ColorRandom extends Source1ParticleOperator {
                 static functionName: string;
                 constructor(system: Source1ParticleSystem);
                 doInit(particle: Source1Particle, elapsedTime: number): void;
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
                 constructor(renderTarget?: RenderTarget);
                 render(delta: number, context: RenderContext): void;
                 savePicture(filename: string, width: number, height: number): void;
                 addPass(pass: Pass): void;
                 setSize(width: number, height: number): void;
             }

             export declare class Cone extends Mesh {
                 #private;
                 constructor(params?: ConeParameters);
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
                     entitynull_1: null;
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
                     entitynull_2: null;
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
                     entitynull_3: null;
                     scale: {
                         i18n: string;
                         f: () => void;
                     };
                     reset_scale: {
                         i18n: string;
                         f: () => vec3;
                     };
                     entitynull_4: null;
                     wireframe: {
                         i18n: string;
                         selected: boolean;
                         f: () => void;
                     };
                     cast_shadows: {
                         i18n: string;
                         selected: boolean | undefined;
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
                     Cone_1: null;
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

             declare type ConeParameters = MeshParameters & {
                 radius?: number;
                 height?: number;
                 segments?: number;
                 hasCap?: boolean;
                 material?: Material;
             };

             export declare class ConstrainDistance extends Operator {
                 #private;
                 _paramChanged(paramName: string, param: OperatorParam): void;
                 applyConstraint(particle: Source2Particle): void;
             }

             export declare class ConstrainDistanceToControlPoint extends Source1ParticleOperator {
                 static functionName: string;
                 constructor(system: Source1ParticleSystem);
                 applyConstraint(particle: Source1Particle): void;
             }

             export declare class ConstrainDistanceToPathBetweenTwoControlPoints extends Source1ParticleOperator {
                 static functionName: string;
                 constructor(system: Source1ParticleSystem);
                 applyConstraint(particle: Source1Particle): void;
             }

             export declare const ContextObserver: ContextObserverClass;

             declare class ContextObserverClass {
                 #private;
                 constructor();
                 handleEvent(event: Event): void;
                 observe(subject: ContextObserverSubject, dependent: ContextObserverTarget): void;
                 unobserve(subject: ContextObserverSubject, dependent: ContextObserverTarget): void;
             }

             declare type ContextObserverSubject = EventTarget | typeof GraphicsEvents;

             declare type ContextObserverTarget = Camera | FirstPersonControl | OrbitControl | RenderTargetViewer;

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
                 set parentControlPoint(parentControlPoint: ControlPoint | undefined);
                 get parentControlPoint(): ControlPoint | undefined;
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
                 render(readBuffer: RenderTarget, writeBuffer: RenderTarget, renderToScreen: boolean, delta: number, context: RenderContext): void;
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
                 constructor(camera: Camera);
                 render(readBuffer: RenderTarget, writeBuffer: RenderTarget, renderToScreen: boolean, delta: number, context: RenderContext): void;
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
                 texture?: Texture;
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
                 getPosition(t: number, out?: vec3): vec3;
             }

             declare class Curve {
                 controlPoints: never[];
                 arcLength: number;
                 getPosition(t: number, out?: vec3): vec3;
                 getArcLength(divisions?: number): number;
                 getPoints(divisions?: number): vec3[];
                 getAppropriateDivision(division: number): number;
             }

             declare class CurveData {
                 #private;
                 /**
                  * Add a sample TODO
                  * @param {Object ChoreographyEvent} event The event to add
                      * @return {Object Choreography} The requested choreography or null
                          */
                      add(time: number, value: CurveDataValue, selected: boolean): void;
                      getValue(time: number): number | null;
                      /**
                       * toString
                       */
                      toString(indent?: string): string;
                  }

                  declare type CurveDataValue = any;

                  export declare function customFetch(resource: string | URL | Request, options?: RequestInit): Promise<Response>;

                  /**
                   * CustomSteamImageOnModel proxy.
                   * @comment ouput variable name: resultVar
                   */
                  export declare class CustomSteamImageOnModel extends Proxy_2 {
                      #private;
                      execute(variables: Map<string, Source1MaterialVariables>, proxyParams: DynamicParams, time: number): void;
                  }

                  export declare class CustomWeaponMaterial extends Source1Material {
                      diffuseModulation: vec4;
                      constructor(repository: string, path: string, vmt: Source1MaterialVmt, params?: Source1MaterialParams);
                      afterProcessProxies(proxyParams: DynamicParams): void;
                      set style(style: string);
                      setColorUniform(uniformName: string, value: string): void;
                      set color0(color: string);
                      set color1(color: string);
                      set color2(color: string);
                      set color3(color: string);
                      setPatternScale(scale: number): void;
                      clone(): CustomWeaponMaterial;
                      get shaderSource(): string;
                  }

                  export declare class Cylinder extends Mesh {
                      #private;
                      constructor(params?: CylinderParameters);
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
                          entitynull_1: null;
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
                          entitynull_2: null;
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
                          entitynull_3: null;
                          scale: {
                              i18n: string;
                              f: () => void;
                          };
                          reset_scale: {
                              i18n: string;
                              f: () => vec3;
                          };
                          entitynull_4: null;
                          wireframe: {
                              i18n: string;
                              selected: boolean;
                              f: () => void;
                          };
                          cast_shadows: {
                              i18n: string;
                              selected: boolean | undefined;
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
                          Cylinder_1: null;
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
                      static constructFromJSON(json: JSONObject, entities: Map<string, Entity | Material>, loadedPromise: Promise<void>): Promise<Cylinder | null>;
                      static getEntityName(): string;
                  }

                  declare type CylinderParameters = MeshParameters & {
                      radius?: number;
                      height?: number;
                      segments?: number;
                      hasCap?: boolean;
                      material?: Material;
                  };

                  export declare class DampenToCP extends Operator {
                      #private;
                      _paramChanged(paramName: string, param: OperatorParam): void;
                      doOperate(particle: Source2Particle, elapsedTime: number, strength: number): void;
                  }

                  export declare class Decal extends Mesh {
                      #private;
                      constructor(params?: DecalParameters);
                      set position(position: vec3);
                      get position(): vec3;
                      parentChanged(): void;
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
                          entitynull_1: null;
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
                          entitynull_2: null;
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
                          entitynull_3: null;
                          scale: {
                              i18n: string;
                              f: () => void;
                          };
                          reset_scale: {
                              i18n: string;
                              f: () => vec3;
                          };
                          entitynull_4: null;
                          wireframe: {
                              i18n: string;
                              selected: boolean;
                              f: () => void;
                          };
                          cast_shadows: {
                              i18n: string;
                              selected: boolean | undefined;
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
                          StaticDecal_1: null;
                          size: {
                              i18n: string;
                              f: () => void;
                          };
                          refresh: {
                              i18n: string;
                              f: () => void;
                          };
                      };
                      static constructFromJSON(json: JSONObject, entities: Map<string, Entity | Material>, loadedPromise: Promise<void>): Promise<Decal | null>;
                      static getEntityName(): string;
                  }

                  declare type DecalParameters = MeshParameters & {
                      size?: vec3;
                  };

                  export declare function decodeLz4(reader: BinaryReader, decompressBlobArray: Uint8Array, compressedSize: number, uncompressedSize: number, outputIndex?: number): number;

                  export declare const DEFAULT_GROUP_ID = 0;

                  export declare const DEFAULT_MAX_PARTICLES = 1000;

                  export declare const DEFAULT_TEXTURE_SIZE = 512;

                  export declare const DEG_TO_RAD: number;

                  export declare function degToRad(deg: number): number;

                  export declare function deleteTexture(texture: WebGLTexture | null): void;

                  export declare class Detex {
                      #private;
                      static decode(format: ImageFormat, width: number, height: number, input: Uint8Array, output: Uint8Array): Promise<void>;
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
                      execute(variables: Map<string, Source1MaterialVariables>, proxyParams: DynamicParams, time: number): void;
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
                      setKeyValues(kvElement: KvElement): void;
                  }

                  declare type DynamicParam = any;

                  declare type DynamicParams = {
                      [key: string]: DynamicParam;
                  };

                  export declare class EmitContinuously extends Source1ParticleOperator {
                      static functionName: string;
                      remainder: number;
                      constructor(system: Source1ParticleSystem);
                      doEmit(elapsedTime: number): void;
                      finished(): boolean;
                  }

                  /**
                   *TODO
                   */
                  export declare class EmitInstantaneously extends Source1ParticleOperator {
                      #private;
                      static functionName: string;
                      constructor(system: Source1ParticleSystem);
                      doEmit(elapsedTime: number): void;
                      reset(): void;
                      finished(): boolean;
                  }

                  export declare class EmitNoise extends Source1ParticleOperator {
                      #private;
                      static functionName: string;
                      constructor(system: Source1ParticleSystem);
                      doEmit(elapsedTime: number): void;
                  }

                  declare class Emitter extends Operator {
                      emitterIndex: number;
                      emissionDuration: number;
                      startTime: number;
                      _paramChanged(paramName: string, param: OperatorParam): void;
                      emitParticle(creationTime: number, elapsedTime: number): Source2Particle_2 | undefined;
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
                      materialsParams: DynamicParams;
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
                      /**
                       * @deprecated Please use `setQuaternion` instead.
                       */
                      set quaternion(quaternion: quat);
                      /**
                       * @deprecated Please use `getQuaternion` instead.
                       */
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
                      get visibleSelf(): boolean | undefined;
                      toggleVisibility(): void;
                      setPlaying(playing: boolean): void;
                      isPlaying(): boolean;
                      togglePlaying(): void;
                      do(action: string, params?: any): void;
                      parentChanged(parent: Entity | null): void;
                      getParentIterator(): Generator<Entity, null | undefined, unknown>;
                      remove(): void;
                      removeThis(): void;
                      removeChildren(): void;
                      disposeChildren(): void;
                      removeSiblings(): void;
                      removeSimilarSiblings(): void;
                      set parent(parent: Entity | null);
                      get parent(): Entity | null;
                      get root(): Entity;
                      addChild(child?: Entity | null): Entity | undefined;
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
                       lookAt(target: vec3, upVector?: vec3): void;
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
                           entitynull_1: null;
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
                           entitynull_2: null;
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
                           entitynull_3: null;
                           scale: {
                               i18n: string;
                               f: () => void;
                           };
                           reset_scale: {
                               i18n: string;
                               f: () => vec3;
                           };
                           entitynull_4: null;
                           wireframe: {
                               i18n: string;
                               selected: boolean;
                               f: () => void;
                           };
                           cast_shadows: {
                               i18n: string;
                               selected: boolean | undefined;
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
                       setMaterialParam(name: string, value: DynamicParam): void;
                       toJSON(): any;
                       static constructFromJSON(json: JSONObject, entities: Map<string, Entity | Material>, loadedPromise: Promise<void>): Promise<Entity | null>;
                       createChild(entityName: string, parameters: any): Promise<Material | Entity | undefined>;
                       fromJSON(json: JSONObject): void;
                       static getEntityName(): string;
                       is(s: string): boolean;
                      }

                      declare type EntityAttributeValue = any;

                      export declare interface EntityDeletedEventData {
                          entity: Entity;
                      }

                      export declare const EntityObserver: EntityObserverClass;

                      export declare type EntityObserverAttributeChangedEvent = {
                          entity: Entity;
                          attributeName: string;
                          newAttributeValue: EntityAttributeValue;
                          oldAttributeValue: EntityAttributeValue;
                      };

                      export declare type EntityObserverChildAddedEvent = {
                          child: Entity;
                          parent: Entity;
                      };

                      export declare type EntityObserverChildRemovedEvent = {
                          child: Entity;
                          parent: Entity;
                      };

                      declare class EntityObserverClass extends MyEventTarget<EntityObserverEventType, CustomEvent<EntityObserverEvent>> {
                          parentChanged(child: Entity, oldParent: Entity | null, newParent: Entity | null): void;
                          childAdded(parent: Entity, child: Entity): void;
                          childRemoved(parent: Entity, child: Entity): void;
                          entityDeleted(entity: Entity): void;
                          propertyChanged(entity: Entity, propertyName: string, oldValue: any, newValue: any): void;
                          attributeChanged(entity: Entity, attributeName: string, oldValue: any, newValue: any): void;
                      }

                      export declare type EntityObserverEntityDeletedEvent = {
                          entity: Entity;
                      };

                      export declare type EntityObserverEvent = EntityObserverParentChangedEvent | EntityObserverChildAddedEvent | EntityObserverChildRemovedEvent | EntityObserverEntityDeletedEvent | EntityObserverPropertyChangedEvent | EntityObserverAttributeChangedEvent;

                      export declare type EntityObserverEventsData = ParentChangedEventData | ChildAddedEventData | ChildRemovedEventData | EntityDeletedEventData | PropertyChangedEventData | AttributeChangedEventData;

                      export declare enum EntityObserverEventType {
                          ParentChanged = "parentchanged",
                          ChildAdded = "childadded",
                          ChildRemoved = "childremoved",
                          EntityDeleted = "entitydeleted",
                          PropertyChanged = "propertychanged",
                          AttributeChanged = "attributechanged"
                      }

                      export declare type EntityObserverParentChangedEvent = {
                          child: Entity;
                          oldParent: Entity | null;
                          newParent: Entity | null;
                      };

                      export declare type EntityObserverPropertyChangedEvent = {
                          entity: Entity;
                          propertyName: string;
                          newPropertyValue: EntityPropertyValue;
                          oldPropertyValue: EntityPropertyValue;
                      };

                      declare interface EntityParameters {
                          name?: string;
                          parent?: Entity;
                          childs?: Entity[];
                          position?: vec3;
                          quaternion?: quat;
                          scale?: vec3;
                          hideInExplorer?: boolean;
                          castShadow?: boolean;
                          receiveShadow?: boolean;
                          visible?: boolean;
                      }

                      declare type EntityPropertyValue = any;

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
                          execute(variables: Map<string, Source1MaterialVariables>, proxyParams: DynamicParams, time: number): void;
                      }

                      export declare function ExponentialDecay(decayTo: number, decayTime: number, dt: number): number;

                      export declare function exportToBinaryFBX(entity: Entity): Promise<ArrayBufferLike>;

                      declare class ExpressionSample {
                          v: number;
                          t: number;
                          s: number;
                          c: number;
                          selected: boolean;
                          setCurveType(curveType: number): void;
                          /**
                           * toString
                           */
                          toString(indent?: string): string;
                      }

                      export declare class EyeRefractMaterial extends Source1Material {
                          #private;
                          useSrgb: boolean;
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

                      export declare function fillCheckerTexture(texture: Texture, color: Color, width: number | undefined, height: number | undefined, needCubeMap: boolean): Texture;

                      export declare function fillFlatTexture(texture: Texture, color: Color, needCubeMap: boolean): Texture;

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

                      declare class FlexAnimationTrack {
                          event: ChoreographyEvent;
                          flags: number;
                          samples: [ExpressionSample[], ExpressionSample[]];
                          controllerName: string;
                          min: number;
                          max: number;
                          constructor(event: ChoreographyEvent);
                          setFlexControllerName(controllerName: string): void;
                          setFlags(flags: number): void;
                          setMin(min: number): void;
                          setMax(max: number): void;
                          isTrackActive(): boolean;
                          isComboType(): boolean;
                          addSample(time: number, value: number, type: number): ExpressionSample;
                          toString(indent?: string): string;
                      }

                      declare class FlexController {
                          #private;
                          getController(name: string, min: number, max: number): number;
                          getControllers(): Record<string, {
                              i: number;
                              min: number;
                              max: number;
                          }>;
                          getControllerValue(name: string): number;
                          getControllerRealValue(name: string): number;
                          setControllerValue(name: string, value: number): void;
                          setAllValues(value: number): void;
                          removeAllControllers(): void;
                      }

                      declare type FlexWeight = Record<string, number>;

                      export declare function flipPixelArray(pixelArray: Uint8ClampedArray, width: number, height: number): void;

                      declare type float = number;

                      export declare class Float32BufferAttribute extends BufferAttribute {
                          constructor(array: typeof TypedArrayProto, itemSize: number, offset?: number, length?: number);
                      }

                      export declare class FloatArrayNode extends ParametersNode {
                          #private;
                          constructor(editor: NodeImageEditor, params?: any);
                          operate(context?: any): Promise<void>;
                          get title(): string;
                          setValue(index: number, value: number): void;
                      }

                      export declare const FLT_EPSILON = 1.1920929e-7;

                      declare class Font {
                          #private;
                          constructor(json: JSONObject);
                          generateShapes(text: string, size?: number): Shape[];
                          createPaths(text?: string, size?: number): ShapePath[];
                          createPath(char: string, scale: number, offsetX: number, offsetY: number): {
                              offsetX: number;
                              path: ShapePath;
                          };
                      }

                      export declare class FontManager {
                          #private;
                          static setFontsPath(url: URL): void;
                          static getFont(name: string, style?: string): Promise<Font | undefined>;
                          static getFontList(): Promise<Map<string, Set<string>>>;
                      }

                      declare class ForwardRenderer extends Renderer {
                          #private;
                          constructor();
                          applyMaterial(program: Program, material: Material): void;
                          render(scene: Scene, camera: Camera, delta: number, context: RenderContext): void;
                          set scissorTest(scissorTest: boolean);
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
                          constructor(params?: MeshParameters);
                      }

                      declare type FuncBrush = {
                          model: number;
                          origin: vec3;
                          position?: vec3;
                          dirty?: boolean;
                      };

                      export declare function generateRandomUUID(): string;

                      export declare function getHelper(type: Entity): PointLightHelper | SpotLightHelper | CameraFrustum | Grid | undefined;

                      export declare function getIncludeList(): MapIterator<string>;

                      export declare function getIncludeSource(name: string): string | undefined;

                      export declare function getLoader(name: string): any | undefined;

                      export declare function getRandomInt(max: number): number;

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
                          constructor(camera: Camera);
                          set intensity(intensity: number);
                          render(readBuffer: RenderTarget, writeBuffer: RenderTarget, renderToScreen: boolean, delta: number, context: RenderContext): void;
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

                      export declare let Graphics: GraphicsType;

                      declare class Graphics_2 {
                          #private;
                          static isWebGL: boolean;
                          static isWebGL2: boolean;
                          static autoClear: boolean;
                          static autoClearColor: boolean;
                          static autoClearDepth: boolean;
                          static autoClearStencil: boolean;
                          static speed: number;
                          static currentTick: number;
                          static glContext: WebGLAnyRenderingContext;
                          static ANGLE_instanced_arrays: any;
                          static OES_texture_float_linear: any;
                          static dragging: boolean;
                          static initCanvas(contextAttributes?: GraphicsInitOptions): typeof Graphics_2;
                          static addCanvas(canvas: HTMLCanvasElement | undefined, options: AddCanvasOptions): HTMLCanvasElement;
                          static removeCanvas(canvas: HTMLCanvasElement): void;
                          static enableCanvas(canvas: HTMLCanvasElement, enable: boolean): void;
                          static listenCanvas(canvas: HTMLCanvasElement): void;
                          static unlistenCanvas(canvas: HTMLCanvasElement): void;
                          static pickEntity(x: number, y: number): Entity | null;
                          static getDefinesAsString(material: Material): string;
                          static render(scene: Scene, camera: Camera, delta: number, context: RenderContext): void;
                          static renderMultiCanvas(delta: number, context?: RenderContext): void;
                          static renderBackground(): void;
                          static clear(color: boolean, depth: boolean, stencil: boolean): void;
                          static _tick(): void;
                          /**
                           * @deprecated Please use `setShaderPrecision` instead.
                           */
                          static set shaderPrecision(shaderPrecision: ShaderPrecision);
                          static setShaderPrecision(shaderPrecision: ShaderPrecision): void;
                          static setShaderQuality(shaderQuality: ShaderQuality): void;
                          static setShaderDebugMode(shaderDebugMode: ShaderDebugMode): void;
                          static setIncludeCode(key: string, code: string): void;
                          static removeIncludeCode(key: string): void;
                          static getIncludeCode(): string;
                          /**
                           * Invalidate all shader (force recompile)
                           */
                          static invalidateShaders(): void;
                          static clearColor(clearColor: vec4): void;
                          static getClearColor(clearColor?: vec4): vec4;
                          static clearDepth(clearDepth: GLclampf): void;
                          static clearStencil(clearStencil: GLint): void;
                          static setColorMask(mask: vec4): void;
                          static set autoResize(autoResize: boolean);
                          static get autoResize(): boolean;
                          static getExtension(name: string): any;
                          static set pixelRatio(pixelRatio: number);
                          static get pixelRatio(): number;
                          static setSize(width: number, height: number): [number, number];
                          static getSize(ret?: vec2): vec2;
                          static setViewport(viewport: vec4): void;
                          /**
                           * @deprecated Please use `setViewport` instead.
                           */
                          static set viewport(viewport: vec4);
                          static getViewport(out: vec4): vec4;
                          /**
                           * @deprecated Please use `getViewport` instead.
                           */
                          static get viewport(): vec4;
                          static set scissor(scissor: vec4);
                          static set scissorTest(scissorTest: boolean);
                          static checkCanvasSize(): void;
                          static play(): void;
                          static pause(): void;
                          static isRunning(): boolean;
                          static createFramebuffer(): WebGLFramebuffer;
                          static deleteFramebuffer(frameBuffer: WebGLFramebuffer): void;
                          static createRenderbuffer(): WebGLRenderbuffer;
                          static deleteRenderbuffer(renderBuffer: WebGLRenderbuffer): void;
                          static pushRenderTarget(renderTarget: RenderTarget | null): void;
                          static popRenderTarget(): RenderTarget | null;
                          static savePicture(scene: Scene, camera: Camera, filename: string, width: number, height: number, type?: string, quality?: number): void;
                          static savePictureAsFile(filename: string, type?: string, quality?: number): Promise<File>;
                          static toBlob(type?: string, quality?: number): Promise<Blob | null>;
                          static _savePicture(filename: string, type?: string, quality?: number): Promise<void>;
                          static startRecording(frameRate: number | undefined, bitsPerSecond: number): void;
                          static stopRecording(fileName?: string): void;
                          static get ready(): Promise<boolean>;
                          static isReady(): Promise<void>;
                          static getParameter(param: GLenum): any;
                          static cleanupGLError(): void;
                          static getGLError(context: string): void;
                          static useLogDepth(use: boolean): void;
                          static getTime(): number;
                          static getWidth(): number;
                          static getHeight(): number;
                          static getCanvas(): HTMLCanvasElement | undefined;
                          static getForwardRenderer(): ForwardRenderer | undefined;
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

                      export declare class GraphicsEvents extends StaticEventTarget {
                          static readonly isGraphicsEvents: true;
                          static tick(delta: number, time: number, speed: number): void;
                          static resize(width: number, height: number): void;
                          static mouseMove(x: number, y: number, pickedEntity: Entity | null, mouseEvent: MouseEvent): void;
                          static mouseDown(x: number, y: number, pickedEntity: Entity | null, mouseEvent: MouseEvent): void;
                          static mouseUp(x: number, y: number, pickedEntity: Entity | null, mouseEvent: MouseEvent): void;
                          static wheel(x: number, y: number, pickedEntity: Entity | null, wheelEvent: WheelEvent): void;
                          static keyDown(keyboardEvent: KeyboardEvent): void;
                          static keyUp(keyboardEvent: KeyboardEvent): void;
                          static touchStart(pickedEntity: Entity | null, touchEvent: TouchEvent): void;
                          static touchMove(pickedEntity: Entity | null, touchEvent: TouchEvent): void;
                          static touchCancel(pickedEntity: Entity | null, touchEvent: TouchEvent): void;
                      }

                      declare interface GraphicsInitOptions {
                          /**
                           * The canvas to render into. Method getContext() must not have been called on the canvas.
                           * If no canvas is provided, one will be created.
                           * If useOffscreenCanvas is true, the canvas will be ignored.
                           */
                          canvas?: HTMLCanvasElement;
                          /** Render using an OffscreenCanvas. Allow rendering to several canvas on a page. Default to false. */
                          useOffscreenCanvas?: boolean;
                          /** Auto resize the canvas to fit its parent. Default to false. */
                          autoResize?: boolean;
                          /** WebGL attributes passed to getContext() */
                          webGL?: WebGLContextAttributes;
                      }

                      declare type GraphicsType = typeof Graphics_2;

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
                          constructor(params?: GridParameters);
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
                              entitynull_1: null;
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
                              entitynull_2: null;
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
                              entitynull_3: null;
                              scale: {
                                  i18n: string;
                                  f: () => void;
                              };
                              reset_scale: {
                                  i18n: string;
                                  f: () => vec3;
                              };
                              entitynull_4: null;
                              wireframe: {
                                  i18n: string;
                                  selected: boolean;
                                  f: () => void;
                              };
                              cast_shadows: {
                                  i18n: string;
                                  selected: boolean | undefined;
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
                              Grid_1: null;
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
                          p: [vec3, vec3, vec3, vec3, vec3, vec3, vec3, vec3];
                          val: [number, number, number, number, number, number, number, number];
                      }

                      export declare class GridMaterial extends Material {
                          constructor(params?: any);
                          set spacing(spacing: number);
                          getShaderSource(): string;
                      }

                      declare type GridParameters = MeshParameters & {
                          size?: number;
                          spacing?: number;
                          normal?: number;
                      };

                      export declare class Group extends Entity {
                          static constructFromJSON(json: JSONObject): Promise<Group>;
                          static getEntityName(): string;
                      }

                      export declare const HALF_PI: number;

                      declare interface HasHitBoxes {
                          getHitboxes(): Hitbox[];
                      }

                      export declare interface HasMaterials {
                          getSkins: () => Promise<Set<string>>;
                          getMaterialsName: (skin: string) => Promise<[string, Set<string>]>;
                          setSkin(skin: string): Promise<void>;
                      }

                      export declare interface HasSkeleton {
                          skeleton: Skeleton | null;
                      }

                      export declare class HeartbeatScale extends Proxy_2 {
                          #private;
                          init(): void;
                          execute(variables: Map<string, Source1MaterialVariables>, proxyParams: DynamicParams, time: number): void;
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
                          parentChanged(parent: Entity | null): void;
                          removeBoxes(): void;
                          static constructFromJSON(): Promise<HitboxHelper>;
                          static getEntityName(): string;
                      }

                      export declare function imageDataToImage(imagedata: ImageData, image?: HTMLImageElement): HTMLImageElement;

                      declare enum ImageFormat {
                          Unknown = "Unknown",
                          Bc1 = "Bc1",
                          Bc2 = "Bc2",
                          Bc3 = "Bc3",
                          Bc4 = "Bc4",
                          Bc4Signed = "Bc4Signed",
                          Bc5 = "Bc5",
                          Bc5Signed = "Bc5Signed",
                          Bc6 = "Bc6",
                          Bc7 = "Bc7",
                          R8 = "R8",
                          R8G8B8A8Uint = "R8G8B8A8Uint",
                          BGRA8888 = "BGRA8888",
                          RGBA = "RGBA",
                          PngR8G8B8A8Uint = "PngR8G8B8A8Uint",
                          PngDXT5 = "PngDXT5"
                      }

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
                          getPredecessor(): Output | undefined;
                          hasPredecessor(): boolean;
                          getType(): void | null;
                          getValue(): Promise<unknown> | null;
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

                      declare class InstancedBufferGeometry extends BufferGeometry {
                          instanceCount: number;
                          constructor(count?: number);
                      }

                      export declare class InstantaneousEmitter extends Emitter {
                          #private;
                          _paramChanged(paramName: string, param: OperatorParam): void;
                          doEmit(elapsedTime: number): void;
                          reset(): void;
                      }

                      export declare class IntArrayNode extends ParametersNode {
                          #private;
                          constructor(editor: NodeImageEditor, params?: any);
                          operate(context?: any): Promise<void>;
                          get title(): string;
                          setValue(index: number, value: number): void;
                      }

                      declare type integer = number;

                      export declare class InterpolateRadius extends Operator {
                          #private;
                          constructor(system: Source2ParticleSystem);
                          _update(): void;
                          _paramChanged(paramName: string, param: OperatorParam): void;
                          doOperate(particle: Source2Particle, elapsedTime: number, strength: number): void;
                      }

                      export declare class Intersection {
                          position: vec3;
                          normal?: vec3;
                          uv?: vec2;
                          distance: number;
                          entity: Entity;
                          distanceFromRay: number;
                          constructor(position: vec3, normal: vec3 | null, uv: vec2 | null, distance: number, entity: Entity, distanceFromRay: number);
                      }

                      export declare class IntProxy extends Proxy_2 {
                          init(): void;
                          execute(variables: Map<string, Source1MaterialVariables>, proxyParams: DynamicParams, time: number): void;
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
                          execute(variables: Map<string, Source1MaterialVariables>, proxyParams: DynamicParams, time: number): void;
                      }

                      export declare class JSONLoader {
                          static fromJSON(rootEntity: JSONObject): Promise<Material | Entity | null>;
                          static loadEntity(jsonEntity: JSONObject, entities: Map<string, Entity | Material>, loadedPromise: Promise<void>): Promise<Entity | Material | null>;
                          static registerEntity(ent: typeof Entity | typeof Material): void;
                      }

                      declare interface JSONObject {
                          [k: string]: JSONValue;
                      }

                      declare type JSONValue = string | number | boolean | null | undefined | JSONValue[] | JSONObject;

                      export declare class KeepOnlyLastChild extends Entity {
                          addChild(child: Entity): Entity | undefined;
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
                          getSubValueAsResource(path: string): string | null;
                          exportAsText(linePrefix: string): string;
                      }

                      /**
                       * Kv3File
                       */
                      declare class Kv3File {
                          isKv3File: true;
                          root: null | Kv3Element;
                          setRoot(root: Kv3Element): void;
                          exportAsText(): string | null;
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

                      declare class KvAttribute {
                          name: string;
                          value: KvAttributeValue;
                          constructor(name: string, value: KvAttributeValue);
                      }

                      declare type KvAttributeValue = any;

                      declare class KvElement {
                          addElement(name: string, value: KvAttributeValue): void;
                          toString(linePrefix?: string): string;
                      }

                      declare class KvReader {
                          root: undefined;
                          rootElements: Record<string, any>;
                          rootId: number;
                          carSize: number;
                          src: string;
                          offset: number;
                          inQuote: boolean;
                          inComment: boolean;
                          currentAttribute?: KvAttribute;
                          currentElement?: KvElement;
                          currentArray?: KvAttributeValue[];
                          currentValue: KvAttributeValue;
                          elementStack: KvElement[];
                          attributeStack: KvAttributeValue[];
                          valuesStack: KvAttributeValue[];
                          keyStack: string[];
                          arrayStack: KvAttributeValue[][];
                          rootElement?: KvElement;
                          rootName: string;
                          currentKey: string;
                          constructor(carSize?: number);
                          readText(src: string): void;
                          getRootElement(): KvElement | undefined;
                          getRootName(): string;
                          readChar(): string | -1;
                          pickChar(): string | -1;
                          pushElement(): void;
                          popElement(): void;
                          pushAttribute(): void;
                          popAttribute(): void;
                          pushValue(): void;
                          popValue(): any;
                          pushKey(): void;
                          popKey(): string | undefined;
                          pushArray(): void;
                          popArray(): void;
                          parse(): boolean;
                          startElement(): void;
                          endElement(): void;
                          startArray(): void;
                          endArray(): void;
                          nextArrayValue(): void;
                          setValue(): void;
                          newLine(): void;
                          comma(): void;
                      }

                      export declare function lerp(min: number, max: number, v: number): number;

                      export declare class LerpEndCapScalar extends Operator {
                          #private;
                          _paramChanged(paramName: string, param: OperatorParam): void;
                          doOperate(particle: Source2Particle, elapsedTime: number, strength: number): void;
                      }

                      export declare class LessOrEqualProxy extends Proxy_2 {
                          execute(variables: Map<string, Source1MaterialVariables>, proxyParams: DynamicParams, time: number): void;
                      }

                      export declare class LifespanDecay extends Source1ParticleOperator {
                          static functionName: string;
                          doOperate(particle: Source1Particle, elapsedTime: number): void;
                      }

                      export declare class LifetimeFromSequence extends Source1ParticleOperator {
                          static functionName: string;
                          constructor(system: Source1ParticleSystem);
                          doInit(particle: Source1Particle, elapsedTime: number): void;
                          initMultipleOverride(): boolean;
                      }

                      export declare class LifetimeRandom extends Source1ParticleOperator {
                          static functionName: string;
                          constructor(system: Source1ParticleSystem);
                          doInit(particle: Source1Particle, elapsedTime: number): void;
                      }

                      export declare class Light extends Entity {
                          #private;
                          shadow?: LightShadow;
                          isLight: boolean;
                          constructor(parameters?: LightParameters);
                          set color(color: vec3);
                          get color(): vec3;
                          set intensity(intensity: number);
                          get intensity(): number;
                          set range(range: number);
                          get range(): number;
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
                              entitynull_1: null;
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
                              entitynull_2: null;
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
                              entitynull_3: null;
                              scale: {
                                  i18n: string;
                                  f: () => void;
                              };
                              reset_scale: {
                                  i18n: string;
                                  f: () => vec3;
                              };
                              entitynull_4: null;
                              wireframe: {
                                  i18n: string;
                                  selected: boolean;
                                  f: () => void;
                              };
                              cast_shadows: {
                                  i18n: string;
                                  selected: boolean | undefined;
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
                              Light_1: null;
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
                          static constructFromJSON(json: JSONObject): Promise<Light>;
                          fromJSON(json: JSONObject): void;
                          static set defaultTextureSize(textureSize: number);
                          static getEntityName(): string;
                          is(s: string): boolean;
                      }

                      export declare class LightMappedGenericMaterial extends Source1Material {
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
                          constructor(params?: LineParameters);
                          set start(start: vec3);
                          getStart(start?: vec3): vec3;
                          set end(end: vec3);
                          getEnd(end?: vec3): vec3;
                          raycast(raycaster: Raycaster, intersections: Intersection[]): void;
                          toJSON(): any;
                          static constructFromJSON(json: JSONObject, entities: Map<string, Entity | Material>, loadedPromise: Promise<void>): Promise<Line>;
                          static getEntityName(): string;
                      }

                      export declare class LinearBezierCurve extends Curve {
                          p0: vec3;
                          p1: vec3;
                          constructor(p0?: vec3, p1?: vec3);
                          getPosition(t: number, out?: vec3): vec3;
                          getArcLength(): number;
                          getAppropriateDivision(): number;
                      }

                      export declare class LinearRamp extends Proxy_2 {
                          #private;
                          init(): void;
                          execute(variables: Map<string, Source1MaterialVariables>, proxyParams: DynamicParams, time: number): void;
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

                      declare type LineParameters = MeshParameters & {
                          start?: vec3;
                          end?: vec3;
                      };

                      export declare class LineSegments extends Mesh {
                          #private;
                          constructor(params?: LineSegmentsParameters);
                          setSegments(positions: number[], colors?: []): void;
                      }

                      declare type LineSegmentsParameters = MeshParameters & {
                          lineStrip?: boolean;
                      };

                      export declare function loadAnimGroup(source2Model: Source2Model, repository: string, animGroupName: string): Promise<Source2AnimGroup>;

                      export declare interface Lockable {
                          isLockable: true;
                          setLocked: (locked: boolean) => void;
                          isLocked: () => boolean;
                      }

                      export declare class LockToBone extends Source1ParticleOperator {
                          static functionName: string;
                          constructor(system: Source1ParticleSystem);
                          doOperate(particle: Source1Particle, elapsedTime: number): void;
                      }

                      export declare interface Loopable {
                          isLoopable: true;
                          setLooping: (looping: boolean) => void;
                          getLooping: () => boolean;
                      }

                      export declare class LoopSubdivision {
                          #private;
                          constructor();
                          subdivide(indices: Uint8Array | Uint32Array, vertices: Float32Array, subdivideCount?: number, tolerance?: number): Promise<{
                              indices: Uint32Array<ArrayBuffer>;
                              vertices: Float32Array<ArrayBuffer>;
                          }>;
                      }

                      declare type LumpData = vec3[] | number[] | string[] | SourceBSPLumpPlane[] | SourceBSPLumpTexData[] | {
                          clusterCount: number;
                          clusterVis: Uint8Array;
                      } | SourceBSPLumpNode[] | SourceBSPLumpTexInfo[] | SourceBSPLumpFace[] | SourceBSPLumpColorRGBExp32[] | SourceBSPLumpLeaf[] | SourceBSPLumpEdge[] | SourceBSPLumpModel[] | SourceBSPLumpBrush[] | SourceBSPLumpBrushSide[] | Map<string, SourceBSPLumpGameLump> | SourceBSPLumpPropStaticDirectory | Map<string, LumpPakFile> | SourceBSPLumpOverlay[] | SourceBSPLumpDispInfo[] | SourceBSPLumpDispVertex[] | SourceBSPLumpEntity;

                      declare type LumpPakFile = {
                          cs: number;
                          fp: number;
                          cm: number;
                          us: number;
                      };

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
                      export declare class MapEntities {
                          #private;
                          static registerEntity(className: string, entityClass: typeof MapEntity): void;
                          static createEntity(map: SourceBSP, className: string): MapEntity | null;
                      }

                      /**
                       * Map entity
                       */
                      declare class MapEntity extends Entity {
                          #private;
                          static incrementalId: number;
                          classname: string;
                          outputs: MapEntityConnection[];
                          readonly m_vecVelocity: vec3;
                          m_flMoveDoneTime: number;
                          m_flLocalTime: number;
                          f: number;
                          keys: Map<string, any>;
                          targetName: string;
                          parentName?: string;
                          readonly map: SourceBSP;
                          constructor(params: MapEntityParameters);
                          setKeyValues(kvElement: KvElement): void;
                          setKeyValue(key: string, value: MapEntityValue): void;
                          getValue(key: string): MapEntityValue;
                          addOutput(outputName: string, outputValue: any): void;
                          setInput(input: string, parameters: any): void;
                          getFlag(position: number): number;
                          move(delta: vec3): void;
                          getAbsOrigin(): vec3;
                          getLocalOrigin(): vec3;
                          getLocalVelocity(): vec3;
                          update(scene: Scene, camera: Camera, delta: number): void;
                          setParent(parent: MapEntity): void;
                          setLocalVelocity(vecVelocity: vec3): void;
                          setMoveDoneTime(delay: number): void;
                          getLocalTime(): number;
                          fireOutput(outputName: string): void;
                          toString(): string;
                      }

                      /**
                       * Entity connection
                       */
                      declare class MapEntityConnection {
                          name: string;
                          parameters: string[] | null;
                          constructor(name: string);
                          fromString(stringDatas: string): void;
                          get outputName(): string;
                          getTargetName(): string | undefined;
                          getTargetInput(): string | undefined;
                          getTargetParameter(): string | undefined;
                          getDelay(): string | undefined;
                          getFireOnlyOnce(): string | undefined;
                          fire(map: SourceBSP): void;
                      }

                      declare type MapEntityParameters = EntityParameters & {
                          map: SourceBSP;
                          className: string;
                      };

                      declare type MapEntityValue = any;

                      export declare class Material {
                          #private;
                          id: string;
                          name: string;
                          uniforms: Record<string, UniformValue>;
                          defines: Record<string, any>;
                          parameters: MaterialParams;
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
                          colorMap: Texture | null;
                          properties: Map<string, any>;
                          static materialList: Record<string, typeof Material>;
                          constructor(params?: MaterialParams);
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
                          setColorMap(texture: Texture | null): void;
                          setColor2Map(texture: Texture | null): void;
                          setDetailMap(texture: Texture | null): void;
                          setNormalMap(texture: Texture | null): void;
                          setCubeMap(texture: Texture | null): void;
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

                      declare type MaterialParams = {
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
                          get skeleton(): Skeleton | undefined;
                          set quaternion(quaternion: quat);
                          get quaternion(): quat;
                          set position(position: vec3);
                          get position(): vec3;
                          set parent(parent: MdlBone | null);
                          get parent(): MdlBone | null;
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
                          vertices: never[];
                          indexes: never[];
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
                          iSequence: number;
                          iPose: number;
                          flags: number;
                          start: number;
                          peak: number;
                          tail: number;
                          end: number;
                      }

                      declare class MdlStudioEvent {
                          cycle: number;
                          event: number;
                          type: number;
                          options: string;
                          name: string;
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
                          groupsize: [number, number];
                          mdl: SourceMdl;
                          previousTime: number;
                          currentTime: number;
                          posekeyindex: number;
                          autolayer: MdlStudioAutoLayer[];
                          events: MdlStudioEvent[];
                          name: string;
                          flags: number;
                          activity: number;
                          id: number;
                          startOffset: number;
                          actweight: number;
                          numevents: number;
                          eventindex: number;
                          bbmin: vec3;
                          bbmax: vec3;
                          numblends: number;
                          animindexindex: number;
                          movementindex: number;
                          paramparent: number;
                          fadeintime: number;
                          fadeouttime: number;
                          localentrynode: number;
                          localexitnode: number;
                          nodeflags: number;
                          entryphase: number;
                          exitphase: number;
                          lastframe: number;
                          nextseq: number;
                          pose: number;
                          numikrules: number;
                          numautolayers: number;
                          autolayerindex: number;
                          weightlistindex: number;
                          numiklocks: number;
                          iklockindex: number;
                          keyvalueindex: number;
                          keyvaluesize: number;
                          cycleposeindex: number;
                          activityName: string;
                          keyvalueText: string;
                          pBoneweight(boneIndex: number): number | undefined;
                          getBlend(x: number, y: number): number | null;
                          poseKey(iParam: number, iAnim: number): number;
                          getAutoLayer(autoLayerIndex: number): MdlStudioAutoLayer | null;
                          get length(): number;
                          play(dynamicProp: Source1ModelInstance): void;
                          processEvent(event: MdlStudioEvent, dynamicProp: Source1ModelInstance): void;
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
                          constructor(params: MeshParameters);
                          /**
                           * @deprecated Please use `setMaterial` instead.
                           */
                          set material(material: Material);
                          /**
                           * @deprecated Please use `getMaterial` instead.
                           */
                          get material(): Material;
                          setGeometry(geometry: BufferGeometry): void;
                          /**
                           * @deprecated Please use `getGeometry` instead.
                           */
                          get geometry(): BufferGeometry;
                          getGeometry(): BufferGeometry;
                          setMaterial(material: Material): void;
                          getMaterial(): Material;
                          getUniform(name: string): any;
                          setUniform(name: string, uniform: UniformValue): void;
                          deleteUniform(name: string): void;
                          setDefine(define: string, value?: string | number): void;
                          removeDefine(define: string): void;
                          exportObj(): ObjDatas;
                          dispose(): void;
                          toString(): string;
                          getBoundsModelSpace(min?: vec3, max?: vec3): void;
                          getBoundingBox(boundingBox?: BoundingBox): BoundingBox;
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
                              entitynull_1: null;
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
                              entitynull_2: null;
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
                              entitynull_3: null;
                              scale: {
                                  i18n: string;
                                  f: () => void;
                              };
                              reset_scale: {
                                  i18n: string;
                                  f: () => vec3;
                              };
                              entitynull_4: null;
                              wireframe: {
                                  i18n: string;
                                  selected: boolean;
                                  f: () => void;
                              };
                              cast_shadows: {
                                  i18n: string;
                                  selected: boolean | undefined;
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
                          map: null;
                          lightMap: null;
                          lightMapIntensity: number;
                          aoMap: null;
                          aoMapIntensity: number;
                          specularMap: null;
                          alphaMap: null;
                          envMap: null;
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
                          static constructFromJSON(json: JSONObject): Promise<MeshBasicMaterial>;
                          fromJSON(json: JSONObject): void;
                          static getEntityName(): string;
                      }

                      export declare class MeshBasicPbrMaterial extends Material {
                          constructor(params?: any);
                          setParameters(params?: any): void;
                          setColor(color: vec4): void;
                          setMetalness(metalness: number): void;
                          setRoughness(roughness: number): void;
                          setColorTexture(colorTexture: Texture): void;
                          setNormalTexture(normalTexture: Texture): void;
                          setMetalnessTexture(metalnessTexture: Texture): void;
                          setRoughnessTexture(roughnessTexture: Texture): void;
                          get shaderSource(): string;
                          toJSON(): any;
                          static constructFromJSON(json: JSONObject): Promise<MeshBasicPbrMaterial>;
                          fromJSON(json: JSONObject): void;
                          static getEntityName(): string;
                      }

                      export declare class MeshFlatMaterial extends Material {
                          constructor(params?: any);
                          getShaderSource(): string;
                      }

                      declare type MeshParameters = EntityParameters & {
                          geometry?: BufferGeometry;
                          material?: Material;
                      };

                      export declare class MeshPhongMaterial extends Material {
                          map: null;
                          lightMap: null;
                          lightMapIntensity: number;
                          aoMap: null;
                          aoMapIntensity: number;
                          specularMap: null;
                          alphaMap: null;
                          envMap: null;
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
                              entitynull_1: null;
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
                              entitynull_2: null;
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
                              entitynull_3: null;
                              scale: {
                                  i18n: string;
                                  f: () => void;
                              };
                              reset_scale: {
                                  i18n: string;
                                  f: () => vec3;
                              };
                              entitynull_4: null;
                              wireframe: {
                                  i18n: string;
                                  selected: boolean;
                                  f: () => void;
                              };
                              cast_shadows: {
                                  i18n: string;
                                  selected: boolean | undefined;
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
                              Metaball_1: null;
                              radius: {
                                  i18n: string;
                                  f: () => void;
                              };
                          };
                      }

                      export declare class Metaballs extends Mesh {
                          #private;
                          cubeWidth: number;
                          constructor(params?: MetaballsParameters);
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
                              entitynull_1: null;
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
                              entitynull_2: null;
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
                              entitynull_3: null;
                              scale: {
                                  i18n: string;
                                  f: () => void;
                              };
                              reset_scale: {
                                  i18n: string;
                                  f: () => vec3;
                              };
                              entitynull_4: null;
                              wireframe: {
                                  i18n: string;
                                  selected: boolean;
                                  f: () => void;
                              };
                              cast_shadows: {
                                  i18n: string;
                                  selected: boolean | undefined;
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
                              Metaballs_1: null;
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

                      declare type MetaballsParameters = MeshParameters & {
                          cubeWidth?: number;
                      };

                      /**
                       * ModelGlowColor proxy.
                       * @comment ouput variable name: resultVar
                       */
                      export declare class ModelGlowColor extends Proxy_2 {
                          #private;
                          init(): void;
                          execute(variables: Map<string, Source1MaterialVariables>, proxyParams: DynamicParams, time: number): void;
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

                      export declare class MovementBasic extends Source1ParticleOperator {
                          static functionName: string;
                          constructor(system: Source1ParticleSystem);
                          doOperate(particle: Source1Particle, elapsedTime: number): void;
                      }

                      export declare class MovementLocktoControlPoint extends Source1ParticleOperator {
                          static functionName: string;
                          static once: boolean;
                          constructor(system: Source1ParticleSystem);
                          doOperate(particle: Source1Particle, elapsedTime: number): void;
                      }

                      export declare class MovementMaxVelocity extends Source1ParticleOperator {
                          static functionName: string;
                          constructor(system: Source1ParticleSystem);
                          doOperate(particle: Source1Particle, elapsedTime: number): void;
                      }

                      export declare class MovementRigidAttachToCP extends Operator {
                          #private;
                          _paramChanged(paramName: string, param: OperatorParam): void;
                          doOperate(particle: Source2Particle, elapsedTime: number, strength: number): void;
                      }

                      export declare class MovementRotateParticleAroundAxis extends Source1ParticleOperator {
                          static functionName: string;
                          once: boolean;
                          constructor(system: Source1ParticleSystem);
                          doOperate(particle: Source1Particle, elapsedTime: number): void;
                      }

                      export declare class Multiply extends Node_2 {
                          #private;
                          constructor(editor: NodeImageEditor, params?: any);
                          operate(context?: any): Promise<void>;
                          get title(): string;
                          dispose(): void;
                      }

                      declare class Node_2 extends MyEventTarget<NodeEventType, CustomEvent<NodeEvent>> {
                          #private;
                          readonly id: string;
                          readonly editor: NodeImageEditor;
                          readonly inputs: Map<string, Input>;
                          readonly outputs: Map<string, Output>;
                          readonly params: Map<string, NodeParam>;
                          readonly previewPic: HTMLImageElement;
                          previewSize: number;
                          autoRedraw: boolean;
                          protected material?: Material;
                          constructor(editor: NodeImageEditor, params?: any);
                          addInput(inputId: string, inputType: number, size?: number): Input;
                          addOutput(outputId: string, outputType: number): Output;
                          getInput(inputId: string): Input | undefined;
                          getOutput(outputId: string): Output | undefined;
                          operate(context?: any): Promise<void>;
                          addParam(param: NodeParam): void;
                          getParam(paramName: string): NodeParam | undefined;
                          getValue(paramName: string): string | number | boolean | number[] | string[] | Float32Array<ArrayBufferLike> | boolean[] | vec2[] | null;
                          setParams(params?: any): void;
                          setParam(paramName: string, paramValue: NodeParamValue, paramIndex?: number): void;
                          setPredecessor(inputId: string, predecessor: Node_2, predecessorOutputId: string): void;
                          getParams(): Map<string, NodeParam>;
                          invalidate(): void;
                          validate(): Promise<void>;
                          revalidate(): Promise<void>;
                          redraw(context?: any): Promise<void>;
                          getInputCount(): number;
                          getType(): void;
                          ready(): Promise<boolean>;
                          isValid(startingPoint?: Node_2): boolean;
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

                      declare type NodeEvent = {
                          eventName?: string;
                          value?: NodeParam;
                      };

                      declare enum NodeEventType {
                          Any = "*",
                          ParamAdded = "paramadded",
                          ParamChanged = "paramchanged"
                      }

                      export declare class NodeImageEditor extends MyEventTarget<NodeImageEditorEventType, CustomEvent<NodeImageEditorEvent>> {
                          #private;
                          textureSize: number;
                          constructor();
                          render(material: Material): void;
                          addNode(operationName: string, params?: any): Node_2 | null;
                          removeNode(node: Node_2): void;
                          removeAllNodes(): void;
                          getVariable(name: string): number | undefined;
                          setVariable(name: string, value: number): Map<string, number>;
                          deleteVariable(name: string): boolean;
                          clearVariables(): void;
                          getNodes(): Set<Node_2>;
                      }

                      declare type NodeImageEditorEvent = {
                          node?: Node_2 | null;
                          eventName?: string;
                      };

                      declare enum NodeImageEditorEventType {
                          Any = "*",
                          NodeAdded = "nodeadded",
                          NodeRemoved = "noderemoved",
                          AllNodesRemoved = "allnodesremoved"
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
                          value: NodeParamValue;
                          length?: number;
                          constructor(name: string, type: NodeParamType, value: NodeParamValue, length?: number);
                      }

                      declare type NodeParamArray = number[] | boolean[] | vec2[] | string[];

                      declare type NodeParamScalar = number | boolean | vec2 | string;

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

                      declare type NodeParamValue = NodeParamScalar | NodeParamArray;

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

                      declare type ObjDatas = {
                          f?: Uint8Array | Uint32Array;
                          v?: Float32Array;
                          vn?: Float32Array;
                          vt?: Float32Array;
                      };

                      export declare class ObjExporter {
                          #private;
                          scene: Scene;
                          camera: Camera;
                          constructor();
                          exportMeshes({ meshes, exportTexture, singleMesh, digits, subdivisions, mergeTolerance }?: {
                              meshes?: Set<Entity> | undefined;
                              exportTexture?: boolean | undefined;
                              singleMesh?: boolean | undefined;
                              digits?: number | undefined;
                              subdivisions?: number | undefined;
                              mergeTolerance?: number | undefined;
                          }): Promise<Set<File>>;
                      }

                      export declare class OBJImporter {
                          static load(txt: string): Mesh;
                      }

                      export declare class OldMoviePass extends Pass {
                          constructor(camera: Camera);
                          render(readBuffer: RenderTarget, writeBuffer: RenderTarget, renderToScreen: boolean, delta: number, context: RenderContext): void;
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
                          getInputValue(inputField: number, particle: Source2Particle): number | vec3 | undefined;
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
                          setTargetPosition(position: vec3): void;
                          set upVector(upVector: vec3);
                          get upVector(): vec3;
                          set minPolarAngle(minPolarAngle: number);
                          get minPolarAngle(): number;
                          set maxPolarAngle(maxPolarAngle: number);
                          get maxPolarAngle(): number;
                          set dampingFactor(dampingFactor: number);
                          get dampingFactor(): number;
                          setupCamera(): void;
                          update(delta?: number): boolean | undefined;
                          set autoRotateSpeed(speed: number);
                          get zoomScale(): number;
                          handleEnabled(): void;
                      }

                      export declare class OrientTo2dDirection extends Source1ParticleOperator {
                          #private;
                          static functionName: string;
                          paramChanged(name: string, param: CDmxAttributeValue | CDmxAttributeValue[]): void;
                          doOperate(particle: Source1Particle, elapsedTime: number): void;
                      }

                      export declare class OscillateScalar extends Source1ParticleOperator {
                          static functionName: string;
                          constructor(system: Source1ParticleSystem);
                          doOperate(particle: Source1Particle, elapsedTime: number): void;
                      }

                      export declare class OscillateScalarSimple extends Operator {
                          #private;
                          _paramChanged(paramName: string, param: OperatorParam): void;
                          doOperate(particle: Source2Particle, elapsedTime: number, strength: number): void;
                      }

                      export declare class OscillateVector extends Source1ParticleOperator {
                          static functionName: string;
                          constructor(system: Source1ParticleSystem);
                          doOperate(particle: Source1Particle, elapsedTime: number): void;
                      }

                      export declare class OutlinePass extends Pass {
                          #private;
                          outlineScene: Scene;
                          width: number;
                          height: number;
                          constructor(outlineScene: Scene, camera: Camera);
                          setSize(width: number, height: number): void;
                          changeVisibilityOfSelectedObjects(visible: boolean): void;
                          changeVisibilityOfNonSelectedObjects(visible: boolean): void;
                          render(readBuffer: RenderTarget, writeBuffer: RenderTarget, renderToScreen: boolean, delta: number, context: RenderContext): void;
                      }

                      declare class Output extends InputOutput {
                          #private;
                          get value(): Promise<unknown>;
                          getValue(): Promise<unknown>;
                          get pixelArray(): Promise<Uint8Array<ArrayBufferLike> | null>;
                          getPixelArray(): Promise<Uint8Array | null>;
                          addSuccessor(successor: InputOutput): void;
                          removeSuccessor(successor: InputOutput): void;
                          hasSuccessor(): boolean;
                          successorsLength(): number;
                          invalidate(): void;
                          getType(): void | null;
                          isValid(startingPoint: Node_2): boolean;
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
                          constructor(camera: Camera);
                          render(readBuffer: RenderTarget, writeBuffer: RenderTarget, renderToScreen: boolean, delta: number, context: RenderContext): void;
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

                      export declare interface ParentChangedEventData {
                          child: Entity;
                          oldParent: Entity | null;
                          newParent: Entity | null;
                      }

                      declare class ParticleColor {
                          r: number;
                          g: number;
                          b: number;
                          a: number;
                          constructor(r?: number, g?: number, b?: number, a?: number);
                          randomize(color1: ParticleColor, color2: ParticleColor): void;
                          setColor(color: ParticleColor): this;
                          setColorAlpha(color: ParticleColor): this;
                          fromVec3(v: vec3): this;
                          fromVec4(v: vec4): this;
                          getRed(): number;
                          getGreen(): number;
                          getBlue(): number;
                          getAlpha(): number;
                          setRed(r: number): void;
                          setGreen(g: number): void;
                          setBlue(b: number): void;
                          toString(): string;
                          setWhite(): void;
                      }

                      export declare function ParticleRandomFloat(id: number, offset: number): number;

                      export declare function ParticleRandomVec3(vec: vec3, id: number, offset1: number, offset2: number, offset3: number): vec3;

                      export declare class Pass {
                          camera?: Camera;
                          quad?: FullScreenQuad;
                          scene?: Scene;
                          enabled: boolean;
                          swapBuffers: boolean;
                          renderToScreen: boolean;
                          setSize(width: number, height: number): void;
                          render(readBuffer: RenderTarget, writeBuffer: RenderTarget, renderToScreen: boolean, delta: number, context: RenderContext): void;
                      }

                      export declare class Path extends Curve {
                          looping: boolean;
                          _curves: Curve[];
                          cursor: vec3;
                          constructor(looping?: boolean);
                          set curves(curves: Curve[]);
                          get curves(): Curve[];
                          addCurve(curve: Curve): void;
                          getArcLength(divisions?: number): number;
                          getPosition(t: number, out?: vec3): vec3;
                          moveTo(p0: vec3): void;
                          lineTo(p1: vec3): void;
                          quadraticCurveTo(p1: vec3, p2: vec3): void;
                          bezierCurveTo(p1: vec3, p2: vec3, p3: vec3): Path;
                          cubicCurveTo(p1: vec3, p2: vec3, p3: vec3): void;
                          getPoints(divisions?: number): vec3[];
                          fromSvgPath(path: string): void;
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
                          constructor(camera: Camera);
                          set horizontalTiles(horizontalTiles: number);
                          set pixelStyle(pixelStyle: number);
                          render(readBuffer: RenderTarget, writeBuffer: RenderTarget, renderToScreen: boolean, delta: number, context: RenderContext): void;
                      }

                      export declare class Plane extends Mesh {
                          #private;
                          constructor(params?: PlaneParameters);
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
                              entitynull_1: null;
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
                              entitynull_2: null;
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
                              entitynull_3: null;
                              scale: {
                                  i18n: string;
                                  f: () => void;
                              };
                              reset_scale: {
                                  i18n: string;
                                  f: () => vec3;
                              };
                              entitynull_4: null;
                              wireframe: {
                                  i18n: string;
                                  selected: boolean;
                                  f: () => void;
                              };
                              cast_shadows: {
                                  i18n: string;
                                  selected: boolean | undefined;
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
                              Plane_1: null;
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

                      declare type PlaneParameters = MeshParameters & {
                          width?: number;
                          height?: number;
                          widthSegments?: number;
                          heightSegments?: number;
                          material?: Material;
                      };

                      export declare class PointLight extends Light {
                          isPointLight: boolean;
                          constructor(params?: PointLightParameters);
                          set castShadow(castShadow: boolean | undefined);
                          get castShadow(): boolean | undefined;
                          toJSON(): any;
                          static constructFromJSON(json: JSONObject): Promise<PointLight>;
                          fromJSON(json: JSONObject): void;
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
                              entitynull_1: null;
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
                              entitynull_2: null;
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
                              entitynull_3: null;
                              scale: {
                                  i18n: string;
                                  f: () => void;
                              };
                              reset_scale: {
                                  i18n: string;
                                  f: () => vec3;
                              };
                              entitynull_4: null;
                              wireframe: {
                                  i18n: string;
                                  selected: boolean;
                                  f: () => void;
                              };
                              cast_shadows: {
                                  i18n: string;
                                  selected: boolean | undefined;
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
                              Light_1: null;
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
                          constructor(params?: MeshParameters);
                      }

                      declare type PointLightParameters = LightParameters & {
                          range?: number;
                      };

                      export declare function polygonise(/*GRIDCELL */ grid: GRIDCELL, /*double */ isolevel: number, /*TRIANGLE **/ triangles: TRIANGLE[]): number;

                      export declare class PositionAlongPathRandom extends Source1ParticleOperator {
                          #private;
                          static functionName: string;
                          constructor(system: Source1ParticleSystem);
                          doInit(particle: Source1Particle, elapsedTime: number): void;
                          reset(): void;
                      }

                      export declare class PositionAlongPathSequential extends Source1ParticleOperator {
                          #private;
                          static functionName: string;
                          constructor(system: Source1ParticleSystem);
                          doInit(particle: Source1Particle, elapsedTime: number): void;
                          reset(): void;
                      }

                      export declare class PositionFromParentParticles extends Source1ParticleOperator {
                          #private;
                          static functionName: string;
                          paramChanged(name: string, param: CDmxAttributeValue | CDmxAttributeValue[]): void;
                          doInit(particle: Source1Particle, elapsedTime: number): void;
                      }

                      export declare class PositionLock extends Operator {
                          #private;
                          constructor(system: Source2ParticleSystem);
                          _paramChanged(paramName: string, param: OperatorParam): void;
                          doOperate(particle: Source2Particle, elapsedTime: number, strength: number): void;
                      }

                      export declare class PositionModifyOffsetRandom extends Source1ParticleOperator {
                          static functionName: string;
                          constructor(system: Source1ParticleSystem);
                          doInit(particle: Source1Particle, elapsedTime: number): void;
                          initMultipleOverride(): boolean;
                      }

                      export declare class PositionOffset extends Operator {
                          #private;
                          _paramChanged(paramName: string, param: OperatorParam): void;
                          doInit(particle: Source2Particle, elapsedTime: number, strength: number): void;
                          initMultipleOverride(): boolean;
                      }

                      export declare class PositionOnModelRandom extends Source1ParticleOperator {
                          static functionName: string;
                          constructor(system: Source1ParticleSystem);
                          doInit(particle: Source1Particle, elapsedTime: number): void;
                      }

                      export declare class PositionWarp extends Operator {
                          #private;
                          _paramChanged(paramName: string, param: OperatorParam): void;
                          doInit(particle: Source2Particle, elapsedTime: number, strength: number): void;
                      }

                      export declare class PositionWithinBoxRandom extends Source1ParticleOperator {
                          static functionName: string;
                          constructor(system: Source1ParticleSystem);
                          doInit(particle: Source1Particle, elapsedTime: number): void;
                      }

                      export declare class PositionWithinSphereRandom extends Source1ParticleOperator {
                          static functionName: string;
                          constructor(system: Source1ParticleSystem);
                          doInit(particle: Source1Particle, elapsedTime: number): void;
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
                          validate(includeCode: string): false | undefined;
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
                          protected datas: any;
                          /**
                           * TODO
                           */
                          setParams(datas: Source1MaterialVmt, variables: Map<string, Source1MaterialVariables>): void;
                          /**
                           * TODO
                           */
                          getData(name: string): any;
                          /**
                           * Dummy function
                           */
                          init(variables: Map<string, Source1MaterialVariables>): void;
                          /**
                           * Dummy function
                           */
                          execute(variables: Map<string, Source1MaterialVariables>, proxyParams: DynamicParams, time: number): void;
                          setResult(variables: Map<string, Source1MaterialVariables>, value: any): void;
                          getVariable(variables: Map<string, Source1MaterialVariables>, name: string): any;
                      }

                      /**
                       * Proxy manager
                       */
                      export declare class ProxyManager {
                          #private;
                          static getProxy(proxyName: string): Proxy_2 | null | undefined;
                          static registerProxy(proxyName: string, proxyClass: typeof Proxy_2): void;
                      }

                      export declare class PullTowardsControlPoint extends Source1ParticleOperator {
                          static functionName: string;
                          constructor(system: Source1ParticleSystem);
                          doForce(particle: Source1Particle, elapsedTime: number, accumulatedForces: vec3, strength?: number): void;
                      }

                      export declare class QuadraticBezierCurve extends Curve {
                          p0: vec3;
                          p1: vec3;
                          p2: vec3;
                          constructor(p0?: vec3, p1?: vec3, p2?: vec3);
                          getPosition(t: number, out?: vec3): vec3;
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

                      export declare class RadiusRandom extends Source1ParticleOperator {
                          static functionName: string;
                          constructor(system: Source1ParticleSystem);
                          doInit(particle: Source1Particle, elapsedTime: number): void;
                      }

                      export declare class RadiusScale extends Source1ParticleOperator {
                          static functionName: string;
                          constructor(system: Source1ParticleSystem);
                          doOperate(particle: Source1Particle, elapsedTime: number): void;
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

                      export declare class RandomForce extends Source1ParticleOperator {
                          static functionName: string;
                          constructor(system: Source1ParticleSystem);
                          doForce(particle: Source1Particle, elapsedTime: number, accumulatedForces: vec3, strength?: number): void;
                      }

                      export declare interface RandomPointOnModel {
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
                          intersectSphere(position: vec3, radius: number, scale: vec3, intersectionPoint1: vec3, intersectionPoint2: vec3): boolean;
                          distanceSqToSegment(v0: vec3, v1: vec3, optionalPointOnRay: vec3, optionalPointOnSegment: vec3): number;
                          createIntersection(position: vec3, normal: vec3 | null, uv: vec2 | null, entity: Entity, distanceFromRay: number): Intersection;
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

                      export declare class RefractMaterial extends Source1Material {
                          clone(): RefractMaterial;
                          getShaderSource(): string;
                      }

                      export declare function registerLoader(name: string, loader: any): void;

                      export declare class RemapControlPointDirectionToVector extends Operator {
                          #private;
                          _paramChanged(paramName: string, param: OperatorParam): void;
                          doOperate(particle: Source2Particle, elapsedTime: number, strength: number): void;
                      }

                      export declare class RemapControlPointToScalar extends Source1ParticleOperator {
                          static functionName: string;
                          constructor(system: Source1ParticleSystem);
                          doInit(particle: Source1Particle, elapsedTime: number): void;
                          initMultipleOverride(): boolean;
                      }

                      export declare class RemapControlPointToVector extends Source1ParticleOperator {
                          static functionName: string;
                          constructor(system: Source1ParticleSystem);
                          doInit(particle: Source1Particle, elapsedTime: number): void;
                          initMultipleOverride(): boolean;
                      }

                      export declare class RemapCPOrientationToRotations extends Operator {
                          #private;
                          _paramChanged(paramName: string, param: OperatorParam): void;
                          doOperate(particle: Source2Particle, elapsedTime: number, strength: number): void;
                      }

                      export declare class RemapCPSpeedToCP extends Source1ParticleOperator {
                          static functionName: string;
                          constructor(system: Source1ParticleSystem);
                          doOperate(particle: Source1Particle, elapsedTime: number): void;
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

                      export declare class RemapDistanceToControlPointToScalar extends Source1ParticleOperator {
                          static functionName: string;
                          constructor(system: Source1ParticleSystem);
                          doOperate(particle: Source1Particle, elapsedTime: number): void;
                      }

                      export declare class RemapDistanceToControlPointToVector extends Source1ParticleOperator {
                          static functionName: string;
                          constructor(system: Source1ParticleSystem);
                          doOperate(particle: Source1Particle, elapsedTime: number): void;
                      }

                      export declare class RemapInitialScalar extends Source1ParticleOperator {
                          static functionName: string;
                          constructor(system: Source1ParticleSystem);
                          doInit(particle: Source1Particle, elapsedTime: number): void;
                          initMultipleOverride(): boolean;
                      }

                      export declare class RemapNoiseToScalar extends Source1ParticleOperator {
                          static functionName: string;
                          constructor(system: Source1ParticleSystem);
                          doInit(particle: Source1Particle, elapsedTime: number): void;
                      }

                      export declare class RemapParticleCountToScalar extends Operator {
                          #private;
                          remapBias: number;
                          _paramChanged(paramName: string, param: OperatorParam): void;
                          doInit(particle: Source2Particle, elapsedTime: number, strength: number): void;
                      }

                      export declare class RemapScalar extends Source1ParticleOperator {
                          static functionName: string;
                          constructor(system: Source1ParticleSystem);
                          doOperate(particle: Source1Particle, elapsedTime: number): void;
                      }

                      export declare class RemapScalarToVector extends Source1ParticleOperator {
                          static functionName: string;
                          constructor(system: Source1ParticleSystem);
                          doInit(particle: Source1Particle, elapsedTime: number): void;
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

                      export declare class RenderAnimatedSprites extends Source1ParticleOperator {
                          #private;
                          static functionName: string;
                          geometry?: BufferGeometry;
                          constructor(system: Source1ParticleSystem);
                          updateParticles(particleSystem: Source1ParticleSystem, particleList: Source1Particle[], elapsedTime: number): void;
                          set maxParticles(maxParticles: number);
                          initRenderer(): void;
                          dispose(): void;
                      }

                      declare class RenderBase extends Operator {
                          #private;
                          protected material: Source2SpriteCard;
                          protected setDefaultTexture: boolean;
                          protected spriteSheet: SpriteSheet | null;
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

                      export declare interface RenderContext {
                          DisableToolRendering?: boolean;
                          width?: number;
                          height?: number;
                          imageBitmap?: {
                              context: ImageBitmapRenderingContext;
                              width: number;
                              height: number;
                          };
                      }

                      export declare class RenderDeferredLight extends RenderBase {
                          #private;
                          _paramChanged(paramName: string, param: OperatorParam): void;
                          initRenderer(particleSystem: Source2ParticleSystem): void;
                          updateParticles(particleSystem: Source2ParticleSystem, particleList: Source2Particle[], elapsedTime: number): void;
                      }

                      declare class Renderer {
                          #private;
                          constructor();
                          getProgram(mesh: Mesh, material: Material): Program;
                          applyMaterial(program: Program, material: Material): void;
                          setupLights(renderList: RenderList, camera: Camera, program: Program, viewMatrix: mat4): void;
                          renderObject(context: RenderContext, renderList: RenderList, object: Mesh, camera: Camera, geometry: BufferGeometry | InstancedBufferGeometry, material: Material, renderLights?: boolean, lightPos?: vec3): void;
                          _prepareRenderList(renderList: RenderList, scene: Scene, camera: Camera, delta: number, context: RenderContext): void;
                          _renderRenderList(renderList: RenderList, camera: Camera, renderLights: boolean, context: RenderContext, lightPos?: vec3): void;
                          render(scene: Scene, camera: Camera, delta: number, context: RenderContext): void;
                          clear(color: boolean, depth: boolean, stencil: boolean): void;
                          /**
                           * Invalidate all shader (force recompile)
                           */
                          invalidateShaders(): void;
                          clearColor(clearColor: vec4): void;
                          clearDepth(clearDepth: GLclampf): void;
                          clearStencil(clearStencil: GLint): void;
                          setToneMapping(toneMapping: ToneMapping): void;
                          getToneMapping(): ToneMapping;
                          setToneMappingExposure(exposure: number): void;
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
                          render(readBuffer: RenderTarget, writeBuffer: RenderTarget, renderToScreen: boolean, delta: number, context: RenderContext): void;
                      }

                      export declare class RenderRope extends Source1ParticleOperator {
                          #private;
                          static functionName: string;
                          texture?: Texture;
                          geometry?: BeamBufferGeometry;
                          imgData?: Float32Array;
                          constructor(system: Source1ParticleSystem);
                          updateParticles(particleSystem: Source1ParticleSystem, particleList: Source1Particle[], elapsedTime: number): void;
                          set maxParticles(maxParticles: number);
                          initRenderer(): void;
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

                      export declare class RenderScreenVelocityRotate extends Source1ParticleOperator {
                          static functionName: string;
                          isScreenVelocityRotate: boolean;
                          constructor(system: Source1ParticleSystem);
                          updateParticles(particleSystem: Source1ParticleSystem, particleList: Source1Particle[], elapsedTime: number): void;
                          initRenderer(): void;
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

                      export declare class RenderSpriteTrail extends Source1ParticleOperator {
                          #private;
                          static functionName: string;
                          texture?: Texture;
                          geometry?: BufferGeometry;
                          imgData?: Float32Array;
                          constructor(system: Source1ParticleSystem);
                          updateParticles(particleSystem: Source1ParticleSystem, particleList: Source1Particle[], elapsedTime: number): void;
                          initRenderer(): void;
                          createParticlesArray(maxParticles: number): void;
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
                          getMaterial(): Material | undefined;
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
                          getAllChildsSorted(filter?: RepositoryFilter): Set<RepositoryEntry>;
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
                          fetch(url: string): Promise<Texture_2 | "error while fetching resource" | null>;
                          import(reader: BinaryReader): Texture_2 | null;
                      }

                      export declare class RingWave extends Operator {
                          #private;
                          t: number;
                          _paramChanged(paramName: string, param: OperatorParam): void;
                          doInit(particle: Source2Particle, elapsedTime: number, strength: number): void;
                      }

                      export declare class RotationBasic extends Source1ParticleOperator {
                          static functionName: string;
                          doOperate(particle: Source1Particle, elapsedTime: number): void;
                      }

                      export declare class RotationControl extends Entity {
                          #private;
                          constructor(params?: RotationControlParameters);
                          setSpeed(rotationSpeed: number): void;
                          /**
                           * @deprecated Please use `setSpeed` instead.
                           */
                          set rotationSpeed(rotationSpeed: number);
                          getSpeed(): number;
                          /**
                           * @deprecated Please use `getSpeed` instead.
                           */
                          get rotationSpeed(): number;
                          setAxis(axis: vec3): void;
                          /**
                           * @deprecated Please use `setAxis` instead.
                           */
                          set axis(axis: vec3);
                          getAxis(): vec3;
                          /**
                           * @deprecated Please use `getAxis` instead.
                           */
                          get axis(): vec3;
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
                              entitynull_1: null;
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
                              entitynull_2: null;
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
                              entitynull_3: null;
                              scale: {
                                  i18n: string;
                                  f: () => void;
                              };
                              reset_scale: {
                                  i18n: string;
                                  f: () => vec3;
                              };
                              entitynull_4: null;
                              wireframe: {
                                  i18n: string;
                                  selected: boolean;
                                  f: () => void;
                              };
                              cast_shadows: {
                                  i18n: string;
                                  selected: boolean | undefined;
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
                              RotationControl_1: null;
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

                      declare type RotationControlParameters = EntityParameters & {
                          axis?: vec3;
                          speed?: number;
                      };

                      export declare class RotationRandom extends Source1ParticleOperator {
                          static functionName: string;
                          constructor(system: Source1ParticleSystem);
                          doInit(particle: Source1Particle, elapsedTime: number): void;
                          initMultipleOverride(): boolean;
                      }

                      export declare class RotationSpeedRandom extends Source1ParticleOperator {
                          static functionName: string;
                          constructor(system: Source1ParticleSystem);
                          doInit(particle: Source1Particle, elapsedTime: number): void;
                      }

                      /**
                       * TODO
                       */
                      export declare class RotationSpinRoll extends Source1ParticleOperator {
                          static functionName: string;
                          constructor(system: Source1ParticleSystem);
                          doOperate(particle: Source1Particle, elapsedTime: number): void;
                      }

                      export declare class RotationSpinYaw extends Source1ParticleOperator {
                          static functionName: string;
                          constructor(system: Source1ParticleSystem);
                          doOperate(particle: Source1Particle, elapsedTime: number): void;
                      }

                      export declare class RotationYawFlipRandom extends Source1ParticleOperator {
                          static functionName: string;
                          constructor(system: Source1ParticleSystem);
                          doInit(particle: Source1Particle, elapsedTime: number): void;
                          initMultipleOverride(): boolean;
                      }

                      export declare class RotationYawRandom extends Source1ParticleOperator {
                          static functionName: string;
                          constructor(system: Source1ParticleSystem);
                          doInit(particle: Source1Particle, elapsedTime: number): void;
                      }

                      export declare class SaturatePass extends Pass {
                          #private;
                          constructor(camera: Camera);
                          set saturation(saturation: number);
                          render(readBuffer: RenderTarget, writeBuffer: RenderTarget, renderToScreen: boolean, delta: number, context: RenderContext): void;
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
                          getWorld(): World | undefined;
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
                          selectEntity(entity: Entity | undefined, scrollIntoView?: boolean): void;
                          getSelectedEntity(): Entity | undefined;
                          getEntityHtml(entity: Entity): void;
                          showContextMenu(contextMenu: HarmonyMenuItems, x: number, y: number, entity: Entity): void;
                          editMaterial(material: Material): void;
                          setJointsRadius(radius: number): void;
                      }

                      declare type SceneParameters = EntityParameters & {
                          camera?: Camera;
                          background?: BackGround;
                          environment?: Environment;
                      };

                      /**
                       * BSP lump
                       * @param {Number} type The lump type
                       */
                      declare class SEBaseBspLump {
                          #private;
                          map: SourceBSP;
                          initialized: boolean;
                          readonly mapOffset?: number;
                          readonly mapLength?: number;
                          lumpOffset: number;
                          lumpLen: number;
                          lumpDataPromise: null;
                          lumpVersion: number;
                          lumpData: LumpData | null;
                          lumpType: number;
                          constructor(map: SourceBSP, reader: BinaryReader, offset: number, length: number);
                          init(): void;
                          /**
                           * Set lump offset
                           * @param {Number} newLumpOffset The lump offset
                           */
                          /**
                           * Get lump offset
                           * @return {Number} The lump offset
                           */
                          getLumpOffset(): number;
                          getMapOffset(): number | undefined;
                          /**
                           * Set lump len
                           * @param {Number} newLumpLen The lump len
                           */
                          /**
                           * Get lump len
                           * @return {Number} The lump len
                           */
                          getLumpLen(): number;
                          /**
                           * Set lump Version
                           * @param {Number} newLumpVersion The lump Version
                           */
                          setLumpVersion(newLumpVersion: number): void;
                          /**
                           * Get lump Version
                           * @return {Number} The lump Version
                           */
                          getLumpVersion(): number;
                          /**
                           * Set lump Data
                           * @param {Object} newLumpData The lump data
                           */
                          setLumpData(newLumpData: LumpData): void;
                          /**
                           * Get lump data
                           * @return {Object} The lump data
                           */
                          getLumpData(): LumpData | null;
                          initDatas(): void;
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
                          execute(variables: Map<string, Source1MaterialVariables>, proxyParams: DynamicParams, time: number): void;
                          isNonZero(value: any): boolean;
                      }

                      /**
                       * TODO
                       */
                      declare class SELightMapNode {
                          x: number;
                          y: number;
                          width: number;
                          height: number;
                          content: null;
                          filled: boolean;
                          id: number;
                          sub1?: SELightMapNode;
                          sub2?: SELightMapNode;
                          constructor(x: number, y: number, width: number, height: number);
                          setContent(content: never): false | undefined;
                          split(x: number, y: number): false | undefined;
                          allocate(width: number, height: number): SELightMapNode | null;
                          toString(): number;
                          checkFull(): void;
                          getAllocatedSize(): number;
                      }

                      export declare class SequenceLifeTime extends Operator {
                          doInit(particle: Source2Particle, elapsedTime: number, strength: number): void;
                      }

                      export declare class SequenceRandom extends Source1ParticleOperator {
                          static functionName: string;
                          constructor(system: Source1ParticleSystem);
                          doInit(particle: Source1Particle, elapsedTime: number): void;
                      }

                      export declare class SetChildControlPointsFromParticlePositions extends Source1ParticleOperator {
                          #private;
                          static functionName: string;
                          constructor(system: Source1ParticleSystem);
                          paramChanged(name: string, param: CDmxAttributeValue | CDmxAttributeValue[]): void;
                          doOperate(particle: Source1Particle, elapsedTime: number): void;
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

                      export declare class SetControlPointPositions extends Source1ParticleOperator {
                          static functionName: string;
                          constructor(system: Source1ParticleSystem);
                          doOperate(particle: Source1Particle, elapsedTime: number): void;
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

                      export declare class SetControlPointToParticlesCenter extends Source1ParticleOperator {
                          static functionName: string;
                          constructor(system: Source1ParticleSystem);
                          doOperate(particle: Source1Particle, elapsedTime: number): void;
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

                      declare const SHADER_PARAM_TYPE_BOOL = 8;

                      declare const SHADER_PARAM_TYPE_COLOR = 2;

                      declare const SHADER_PARAM_TYPE_ENVMAP = 6;

                      declare const SHADER_PARAM_TYPE_FLOAT = 7;

                      declare const SHADER_PARAM_TYPE_FOURCC = 9;

                      declare const SHADER_PARAM_TYPE_INTEGER = 1;

                      declare const SHADER_PARAM_TYPE_MATERIAL = 11;

                      declare const SHADER_PARAM_TYPE_MATRIX = 10;

                      declare const SHADER_PARAM_TYPE_MATRIX4X2 = 13;

                      declare const SHADER_PARAM_TYPE_STRING = 12;

                      declare const SHADER_PARAM_TYPE_TEXTURE = 0;

                      declare const SHADER_PARAM_TYPE_VEC2 = 3;

                      declare const SHADER_PARAM_TYPE_VEC3 = 4;

                      declare const SHADER_PARAM_TYPE_VEC4 = 5;

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
                          static getCustomSourceAnnotations(name: string): any[] | null;
                          static getIncludeAnnotations(includeName: string): {
                              type: any;
                              column: any;
                              row: number;
                              text: any;
                          }[] | undefined;
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
                          set shaderSource(shaderSource: string);
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
                          constructor();
                          render(renderer: Renderer, renderList: RenderList, camera: Camera, context: RenderContext): void;
                      }

                      declare class Shape_2 extends Path {
                          uuid: string;
                          type: string;
                          holes: Path[];
                          getPointsHoles(divisions: number): vec3[][];
                          extractPoints(divisions: number): {
                              shape: vec3[];
                              holes: vec3[][];
                          };
                      }

                      declare class ShapePath {
                          type: string;
                          subPaths: Path[];
                          currentPath: Path | null;
                          moveTo(x: number, y: number): ShapePath;
                          lineTo(x: number, y: number): ShapePath;
                          quadraticCurveTo(aCPx: number, aCPy: number, aX: number, aY: number): ShapePath;
                          bezierCurveTo(aCP1x: number, aCP1y: number, aCP2x: number, aCP2y: number, aX: number, aY: number): ShapePath;
                          toShapes(isCCW?: boolean, noHoles?: boolean): Shape_2[];
                      }

                      export declare function SimpleSpline(value: number): number;

                      export declare class Sine extends Proxy_2 {
                          #private;
                          init(): void;
                          execute(variables: Map<string, Source1MaterialVariables>, proxyParams: DynamicParams, time: number): void;
                      }

                      export declare class SkeletalMesh extends Mesh {
                          #private;
                          isSkeletalMesh: boolean;
                          skeleton: Skeleton;
                          constructor(params: SkeletalMeshParameters);
                          set bonesPerVertex(bonesPerVertex: number);
                          get bonesPerVertex(): number;
                          exportObj(): ObjDatas;
                          getRandomPointOnModel(vec: vec3, initialVec: vec3, bones: [Bone, number][]): {};
                          getBoundingBox(boundingBox?: BoundingBox): BoundingBox;
                          toString(): string;
                          prepareRayCasting(): void;
                          raycast(raycaster: Raycaster, intersections: Intersection[]): void;
                          getSkinnedVertex(): [Float32Array, Float32Array];
                          static getEntityName(): string;
                      }

                      declare type SkeletalMeshParameters = MeshParameters & {
                          skeleton: Skeleton;
                      };

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
                          getBoneByName(boneName: string): Bone | undefined;
                          getBoneById(boneId: number): Bone | undefined;
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
                          constructor(parameters: SkeletonHelperParameters);
                          parentChanged(parent: Entity): void;
                          getWorldPosition(vec?: vec3): vec3;
                          getWorldQuaternion(q?: quat): quat;
                          get wireframe(): number;
                          displayBoneJoints(display: boolean): void;
                          setJointsRadius(radius: number): void;
                          dispose(): void;
                      }

                      declare type SkeletonHelperParameters = EntityParameters & {
                          skeleton?: Skeleton;
                      };

                      export declare class SketchPass extends Pass {
                          constructor(camera: Camera);
                          render(readBuffer: RenderTarget, writeBuffer: RenderTarget, renderToScreen: boolean, delta: number, context: RenderContext): void;
                      }

                      export declare function smartRound(input: number, precision?: number): number;

                      export declare class SnapshotRigidSkinToBones extends Operator {
                          #private;
                          _paramChanged(paramName: string, param: OperatorParam): void;
                          doOperate(particle: Source2Particle, elapsedTime: number, strength: number): void;
                      }

                      export declare class Source1BspLoader extends SourceBinaryLoader {
                          #private;
                          parse(repository: string, fileName: string, arrayBuffer: ArrayBuffer): SourceBSP;
                      }

                      /**
                       * BSP Tree
                       */
                      declare class Source1BspTree {
                          #private;
                          visibilityClusters: undefined;
                          clustersCount: number;
                          countRemoveMe: number;
                          constructor(map: SourceBSP);
                          getLeafId(pos: vec3): number | undefined;
                          isLeafVisible(fromLeafId: number, toLeafId: number): boolean;
                          isVisLeaf(leafId: number): boolean;
                          addPropToLeaf(leafId: number, propId: number): void;
                      }

                      export declare class Source1Material extends Material {
                          #private;
                          readonly vmt: Source1MaterialVmt;
                          readonly repository: string;
                          readonly path: string;
                          proxyParams: any;
                          proxies: Proxy_2[];
                          variables: Map<string, any>;
                          protected useSrgb: boolean;
                          constructor(repository: string, path: string, vmt: Source1MaterialVmt, params?: Source1MaterialParams);
                          init(): void;
                          getTexture(role: TextureRole, repository: string, path: string, frame: number, needCubeMap?: boolean, srgb?: boolean): Texture | null;
                          getTexCoords(flCreationTime: number, flCurTime: number, flAgeScale: number, nSequence: number): SpriteSheetCoord | null;
                          getFrameSpan(sequence: number): any;
                          updateMaterial(time: number, mesh: Mesh): void;
                          _afterProcessProxies(proxyParams?: {}): void;
                          afterProcessProxies(proxyParams?: {}): void;
                          getAlpha(): number;
                          computeModulationColor(out: vec4): vec4;
                          getDefaultParameters(): VmtParameters;
                          sanitizeValue(parameterName: string, value: any): any;
                          setKeyValue(key: string, value: any): void;
                          clone(): Source1Material;
                          dispose(): void;
                      }

                      export declare class Source1MaterialManager {
                          #private;
                          static fallbackRepository: string;
                          static getMaterial(repository: string, path: string, searchPaths?: string[]): Promise<Source1Material | null>;
                          static addRepository(repository: string): void;
                          static getMaterialList(): Promise<{
                              files: {
                                  name: string;
                                  files: JSONObject[];
                              }[];
                          }>;
                      }

                      declare type Source1MaterialParams = MaterialParams & {};

                      declare type Source1MaterialVariables = any;

                      declare type Source1MaterialVmt = Record<string, any>;

                      export declare class Source1MdlLoader extends SourceBinaryLoader {
                          #private;
                          load(repository: string, path: string): Promise<SourceMdl | null>;
                          parse(repository: string, fileName: string, arrayBuffer: ArrayBuffer): SourceMdl;
                          _parseAnimSection(reader: BinaryReader, animDesc: MdlStudioAnimDesc, frameIndex: number): MdlStudioAnim[] | null;
                      }

                      export declare type Source1ModelAnimation = {
                          name: string;
                          weight: number;
                      };

                      export declare class Source1ModelInstance extends Entity implements Animated, HasMaterials, HasHitBoxes, HasSkeleton, RandomPointOnModel {
                          #private;
                          isSource1ModelInstance: boolean;
                          animable: boolean;
                          hasAnimations: true;
                          sourceModel: SourceModel;
                          bodyParts: Record<string, Entity>;
                          sequences: Source1ModelSequences;
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
                          get skeleton(): Skeleton | null;
                          set skeleton(skeleton: Skeleton | null);
                          addChild(child?: Entity | null): Entity | undefined;
                          removeChild(child: Entity): void;
                          set skin(skin: string);
                          get skin(): string;
                          setSkin(skin: string): Promise<void>;
                          set sheen(sheen: vec3);
                          set tint(tint: vec3 | null);
                          getTint(out?: vec4): vec4 | undefined;
                          setPoseParameter(paramName: string, paramValue: number): void;
                          playAnimation(name: string): void;
                          setAnimation(id: number, name: string, weight: number): Promise<void>;
                          playSequence(sequenceName: string): void;
                          addAnimation(id: number, animationName: string, weight?: number): Promise<void>;
                          update(scene: Scene, camera: Camera, delta: number): void;
                          setMaterialOverride(materialOverride: Material | null): Promise<void>;
                          getSkins(): Promise<Set<string>>;
                          getMaterialsName(skin: string): Promise<[string, Set<string>]>;
                          getBoneById(boneId: number): Bone | undefined;
                          renderBodyParts(render: boolean): void;
                          renderBodyPart(bodyPartName: string, render: boolean): void;
                          resetBodyPartModels(): void;
                          setBodyPartIdModel(bodyPartId: number, modelId: number): void;
                          setBodyPartModel(bodyPartName: string, modelId: number): void;
                          getBodyGroups(): Map<string, number>;
                          toString(): string;
                          attachSystem(system: Source1ParticleSystem, attachmentName?: string, cpIndex?: number, offset?: vec3): void;
                          getAttachment(attachmentName: string): Bone | undefined;
                          getBoneByName(boneName: string): Bone | undefined;
                          set material(material: Material);
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
                              entitynull_1: null;
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
                              entitynull_2: null;
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
                              entitynull_3: null;
                              scale: {
                                  i18n: string;
                                  f: () => void;
                              };
                              reset_scale: {
                                  i18n: string;
                                  f: () => vec3;
                              };
                              entitynull_4: null;
                              wireframe: {
                                  i18n: string;
                                  selected: boolean;
                                  f: () => void;
                              };
                              cast_shadows: {
                                  i18n: string;
                                  selected: boolean | undefined;
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
                              Source1ModelInstance_1: null;
                              skin: {
                                  i18n: string;
                                  submenu: any[];
                              };
                              tint: {
                                  i18n: string;
                                  f: (entity: Source1ModelInstance) => Promise<vec4>;
                              };
                              reset_tint: {
                                  i18n: string;
                                  f: (entity: Source1ModelInstance) => null;
                                  disabled: boolean;
                              };
                              animation: {
                                  i18n: string;
                                  f: (entity: Source1ModelInstance) => Promise<void>;
                              };
                              overrideallmaterials: {
                                  i18n: string;
                                  f: (entity: Source1ModelInstance) => Promise<void>;
                              };
                              Source1ModelInstance_2: null;
                              animate: {
                                  i18n: string;
                                  selected: boolean;
                                  f: () => 0 | 1;
                              };
                              frame: {
                                  i18n: string;
                                  f: () => void;
                              };
                              Source1ModelInstance_3: null;
                              copy_filename: {
                                  i18n: string;
                                  f: () => Promise<void>;
                              };
                          };
                          getParentModel(): Source1ModelInstance;
                          getRandomPointOnModel(vec: vec3, initialVec: vec3, bones: [Bone, number][]): vec3;
                          setPosition(position: vec3): void;
                          set quaternion(quaternion: vec4);
                          get quaternion(): vec4;
                          static set animSpeed(speed: number);
                          setFlexes(flexes?: {}): void;
                          resetFlexParameters(): void;
                          playDefaultAnim(): Promise<void>;
                          getHitboxes(): Hitbox[];
                          replaceMaterial(material: Material, recursive?: boolean): void;
                          resetMaterial(recursive?: boolean): void;
                          getAnimations(): Promise<Set<string>>;
                          toJSON(): any;
                          static constructFromJSON(json: JSONObject, entities: Map<string, Entity | Material>, loadedPromise: Promise<void>): Promise<Entity | null>;
                          fromJSON(json: JSONObject): void;
                          dispose(): void;
                          static getEntityName(): string;
                          is(s: string): boolean;
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
                          execute(variables: Map<string, Source1MaterialVariables>, proxyParams: DynamicParams, time: number): void;
                      }

                      /**
                       * TODO
                       */
                      declare class Source1Particle {
                          currentTime: number;
                          previousElapsedTime: number;
                          name: string;
                          id: number;
                          isAlive: boolean;
                          readonly position: vec3;
                          readonly prevPosition: vec3;
                          readonly cpPosition: vec3;
                          readonly cpOrientation: quat;
                          readonly cpOrientationInvert: quat;
                          velocity: vec3;
                          color: ParticleColor;
                          initialColor: ParticleColor;
                          uMin: number;
                          uMax: number;
                          vMin: number;
                          vMax: number;
                          system: Source1ParticleSystem;
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
                          posLockedToCP: number;
                          rotLockedToCP: number;
                          trailLength: number;
                          initialCPPosition: vec3 | null;
                          initialVecOffset: vec3 | null;
                          initialCPQuaternion: quat | null;
                          renderScreenVelocityRotate: boolean;
                          initialVec?: vec3;
                          bones?: [Bone, number][];
                          m_flRotateRate: number;
                          m_flForward: number;
                          deltaL: number;
                          constructor(id: number, system: Source1ParticleSystem);
                          step(elapsedTime: number): void;
                          start(): void;
                          die(): void;
                          reset(): void;
                          setInitialField(field: number, value: SourceParticleFieldValue, mulInitial: boolean): void;
                          setField(field: number | undefined, value: SourceParticleFieldValue, mulInitial?: boolean, setInitial?: boolean): void;
                          /**
                           * TODO
                           */
                          getField(field?: number, initial?: boolean): SourceParticleFieldValue;
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
                          setInitialColor(color: ParticleColor): void;
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
                          getWorldPos(worldPos: vec3): vec3;
                          /**
                           * Get particle world position
                           * @param {vec3|null} The receiving vector. Created if null.
                           * @return {vec3} The world position.
                           */
                          getLocalPos(worldPos: vec3): vec3;
                      }

                      export declare class Source1ParticleControler {
                          #private;
                          static speed: number;
                          static visible?: boolean;
                          static fixedTime?: number;
                          static setParticleConstructor(ps: typeof Source1ParticleSystem): void;
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
                          static addSystem2(system: Source1ParticleSystem): void;
                          /**
                           * Create system
                           * @param {Number} elapsedTime Step time
                           */
                          static createSystem(repository: string, systemName: string): Promise<Source1ParticleSystem>;
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
                          static setActive(system: Source1ParticleSystem): void;
                          /**
                           * Set a system inactive
                           */
                          static setInactive(system: Source1ParticleSystem): void;
                          static setSpeed(s: number): void;
                          static getSystemList(): Promise<FileSelectorFile>;
                          static set renderSystems(renderSystems: boolean);
                      }

                      declare class Source1ParticleOperator {
                          #private;
                          protected particleSystem: Source1ParticleSystem;
                          material?: Material;
                          materialLoaded: boolean;
                          paramList: ParamType[];
                          mesh?: Mesh;
                          constructor(system: Source1ParticleSystem);
                          get functionName(): string;
                          static get functionName(): string;
                          static getFunctionName(): string;
                          initializeParticle(particle: Source1Particle, elapsedTime: number): void;
                          operateParticle(particle: Source1Particle, elapsedTime: number): void;
                          forceParticle(particle: Source1Particle, elapsedTime: number, accumulatedForces?: vec3): void;
                          constraintParticle(particle: Source1Particle): void;
                          doEmit(elapsedTime: number): void;
                          doInit(particle: Source1Particle, elapsedTime: number): void;
                          doOperate(particle: Source1Particle, elapsedTime: number): void;
                          doForce(particle: Source1Particle, elapsedTime: number, accumulatedForces?: vec3, strength?: number): void;
                          applyConstraint(particle: Source1Particle): void;
                          doRender(particle: Source1Particle[], elapsedTime: number, material: Material): void;
                          initRenderer(): void;
                          updateParticles(particleSystem: Source1ParticleSystem, particleList: Source1Particle[], elapsedTime: number): void;
                          emitParticle(creationTime: number, elapsedTime: number): Source1Particle | null;
                          setMaterial(material: Material): void;
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
                          getInputValue(inputField: number, particle: Source1Particle): any;
                          getInputValueAsVector(inputField: number, particle: Source1Particle, v: vec3): void;
                          setOutputValue(outputField: number, value: any, particle: Source1Particle): void;
                          initMultipleOverride(): boolean;
                          finished(): boolean;
                          setOrientationType(orientationType: number): void;
                          dispose(): void;
                      }

                      export declare class Source1ParticleOperators {
                          #private;
                          static getOperator(system: Source1ParticleSystem, name: string): Source1ParticleOperator | null;
                          static getOperators(type: string): string[];
                          static registerOperator(name: string | typeof Source1ParticleOperator, operator?: typeof Source1ParticleOperator): void;
                      }

                      export declare class Source1ParticleSystem extends Entity implements Loopable {
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
                          currentOrientation: quat;
                          prevOrientation: quat;
                          emitters: Record<string, Source1ParticleOperator>;
                          initializers: Record<string, Source1ParticleOperator>;
                          operators: Record<string, Source1ParticleOperator>;
                          forces: Map<string, Source1ParticleOperator>;
                          constraints: Record<string, Source1ParticleOperator>;
                          tempChildren: Record<string, string>;
                          operatorRandomSampleOffset: number;
                          parentSystem?: Source1ParticleSystem;
                          firstStep: boolean;
                          pcf?: SourcePCF;
                          material?: Source1Material;
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
                          stepConstraints(particle: Source1Particle): void;
                          createParticle(creationTime: number, elapsedTime: number): Source1Particle | null;
                          getWorldPosition(vec?: vec3): vec3;
                          stepControlPoint(): void;
                          setParam(element: CDmxAttribute): this | null | undefined;
                          addParam(param: string, type: string, value: any): void;
                          setParameter(parameter: string, type: any, value: any): this | undefined;
                          propertyChanged(name: string): void;
                          getParameter(parameterName: string): any;
                          setMaxParticles(max: number): void;
                          setRadius(radius: number): void;
                          setInitialParticles(initial: number): void;
                          setMinimumTickRate(minimum: number): void;
                          setMaximumTickRate(maximum: number): void;
                          setMaterialName(materialName: string): Promise<void>;
                          setSnapshot(snapshot: any): void;
                          addSub(type: string, object: Source1ParticleOperator, id: string): void;
                          getControlPoint(controlPointId: number): ControlPoint | null;
                          getControlPoints(): ControlPoint[];
                          getOwnControlPoint(controlPointId: number): ControlPoint;
                          addTempChild(name: string, id: string): void;
                          addChildSystem(particleSystem: Source1ParticleSystem): void;
                          setParent(parentSystem: Source1ParticleSystem): Source1ParticleSystem;
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
                          getParticle(index?: number): Source1Particle | undefined;
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
                          getChildrenSystems(): Source1ParticleSystem[];
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
                              entitynull_1: null;
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
                              entitynull_2: null;
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
                              entitynull_3: null;
                              scale: {
                                  i18n: string;
                                  f: () => void;
                              };
                              reset_scale: {
                                  i18n: string;
                                  f: () => vec3;
                              };
                              entitynull_4: null;
                              wireframe: {
                                  i18n: string;
                                  selected: boolean;
                                  f: () => void;
                              };
                              cast_shadows: {
                                  i18n: string;
                                  selected: boolean | undefined;
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
                              SourceEngineParticleSystem_1: null;
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
                          static constructFromJSON(json: any, entities: Map<string, Entity>, loadedPromise: Promise<void>): Promise<Source1ParticleSystem>;
                          static getEntityName(): string;
                      }

                      export declare class Source1PcfLoader extends SourceBinaryLoader {
                          #private;
                          parse(repository: string, path: string, content: ArrayBuffer): SourcePCF | null;
                          getString(pcf: SourcePCF, index: number): string;
                          getElement(pcf: SourcePCF, index: number): CDmxElement | null;
                      }

                      export declare class Source1SoundManager {
                          #private;
                          /**
                           * Play a sound
                           * @param {String} soundName soundName
                           */
                          static playSound(repositoryName: string, soundName: string): Promise<HTMLAudioElement | null>;
                          static loadManifest(repositoryName: string, fileName: string): void;
                          static mute(): void;
                          static unmute(): void;
                      }

                      export declare const Source1TextureManager: Source1TextureManagerClass;

                      declare class Source1TextureManagerClass {
                          #private;
                          fallbackRepository: string;
                          constructor();
                          getTexture(repository: string, path: string, needCubeMap?: boolean, srgb?: boolean): AnimatedTexture | null;
                          getVtf(repository: string, path: string): Promise<Source1Vtf | null>;
                          getTextureAsync(repository: string, path: string, frame: number, needCubeMap: boolean, defaultTexture?: Texture, srgb?: boolean): Promise<Texture | null>;
                          getInternalTextureName(): string;
                          addInternalTexture(repository: string, texture?: AnimatedTexture): {
                              name: string;
                              texture: AnimatedTexture;
                          };
                          setTexture(repository: string, path: string, texture: AnimatedTexture): void;
                          removeTexture(repository: string, path: string): void;
                      }

                      export declare const Source1VmtLoader: Source1VmtLoaderClass;

                      declare class Source1VmtLoaderClass {
                          #private;
                          load(repository: string, path: string): Promise<Source1Material | null>;
                          parse(repository: string, path: string, content: string): Promise<Source1Material | null>;
                          setMaterial(/*TODO: add repository param*/ fileName: string, fileContent: string): void;
                          registerMaterial(materialName: string, materialClass: typeof Source1Material): void;
                      }

                      export declare class Source1Vtf {
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
                          sheet: SpriteSheet | null;
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
                          fillTexture(glContext: WebGLAnyRenderingContext, texture: Texture, mipmapLvl: number, frame1?: number, srgb?: boolean): void;
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

                      export declare class Source1VtxLoader extends SourceBinaryLoader {
                          #private;
                          constructor(mdlVersion: number);
                          load(repository: string, path: string): Promise<SourceVtx | null>;
                          parse(repository: string, fileName: string, arrayBuffer: ArrayBuffer): SourceVtx;
                      }

                      export declare class Source1VvdLoader extends SourceBinaryLoader {
                          #private;
                          load(repository: string, path: string): Promise<SourceVvd | null>;
                          parse(repository: string, fileName: string, arrayBuffer: ArrayBuffer): SourceVvd;
                      }

                      export declare const SOURCE2_DEFAULT_BODY_GROUP = "autodefault";

                      export declare const SOURCE2_DEFAULT_RADIUS = 5;

                      declare class Source2Animation {
                          #private;
                          file?: Source2File;
                          constructor(animGroup: Source2AnimGroup);
                          setFile(sourceFile: Source2File): void;
                          setAnimDatas(data: Kv3Element): void;
                          getAnimDesc(name: string): Source2AnimationDesc | undefined;
                          getDecodeKey(): Kv3Element | undefined;
                          getDecoderArray(): Source2AnimeDecoder[];
                          getSegment(segmentIndex: number): Kv3Element | null;
                          getAnimations(animations?: Set<string>): Promise<Set<string>>;
                          getAnimationsByActivity(activityName: string): Source2AnimationDesc[];
                          get animArray(): Kv3Element[];
                          getAnimationByName(animName: string): Source2AnimationDesc | undefined;
                      }

                      declare class Source2AnimationDesc {
                          #private;
                          data: Kv3Element;
                          constructor(source2Model: Source2Model, data: Kv3Element, animationResource: Source2Animation | Source2SeqGroup);
                          get fps(): number;
                          get lastFrame(): number;
                          getFrame(frameIndex: number): any[];
                          matchActivity(activityName: string): boolean;
                          modifiersScore(activityName: string, modifiers: Set<string>): number;
                          matchModifiers(activityName: string, modifiers: Set<string>): boolean;
                      }

                      declare class Source2Animations {
                          #private;
                          addAnimations(animations: Source2AnimationDesc[]): void;
                          getAnimations(): Source2AnimationDesc[];
                          getAnimation(activityName: string, activityModifiers?: Set<never>): Source2AnimationDesc | null;
                          getBestAnimation(activityName: string, activityModifiers: Set<string>): Source2AnimationDesc | null;
                      }

                      declare type Source2AnimeDecoder = {
                          name: string;
                          version: number;
                          type: number;
                      };

                      declare class Source2AnimGroup {
                          #private;
                          repository: string;
                          file?: Source2File;
                          decoderArray: Source2AnimeDecoder[];
                          localAnimArray: string[] | null;
                          decodeKey?: Kv3Element;
                          directHSeqGroup?: Source2SeqGroup;
                          loaded: boolean;
                          constructor(source2Model: Source2Model, repository: string);
                          setFile(sourceFile: Source2File): void;
                          setAnimationGroupResourceData(localAnimArray: string[] | null, decodeKey: Kv3Element): void;
                          getAnim(animIndex: number): Source2Animation | null;
                          getAnimDesc(name: string): Source2AnimationDesc | undefined;
                          matchActivity(activity: string, modifiers: string[]): any;
                          getAnims(): Set<Source2Animation>;
                          getAnimationsByActivity(activityName: string): Source2AnimationDesc[];
                          getDecodeKey(): Kv3Element | undefined;
                          get source2Model(): Source2Model;
                          getAnimationByName(animName: string): Source2AnimationDesc | null;
                          set _changemyname(_changemyname: Source2Animation[]);
                          get _changemyname(): Source2Animation[];
                      }

                      export declare class Source2CablesMaterial extends Source2Material {
                          get shaderSource(): string;
                      }

                      export declare class Source2ColorCorrection extends Source2Material {
                          get shaderSource(): string;
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
                          _afterProcessProxies(proxyParams: DynamicParams): void;
                          get shaderSource(): string;
                      }

                      export declare class Source2EnvironmentBlend extends Source2Material {
                          get shaderSource(): string;
                      }

                      export declare class Source2Error extends Source2Material {
                          constructor(repository: string, shader: string, source2File?: Source2File);
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
                          readonly indices: Map<number, any[]>;
                          readonly vertices: Map<number, any[]>;
                          constructor(repository: string, fileName: string);
                          addBlock(block: Source2FileBlock): void;
                          getBlockByType(type: string): Source2FileBlock | null;
                          getBlockById(id: number): Source2FileBlock | null;
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
                          readonly reader: BinaryReader;
                          readonly offset: number;
                          readonly length: number;
                          keyValue?: Kv3File;
                          constructor(file: Source2File, id: number, type: string, reader: BinaryReader, offset: number, length: number);
                          getKeyValue(path: string): Kv3Element | Kv3Value | undefined | null;
                          getKeyValueAsNumber(path: string): number | null;
                          getKeyValueAsStringArray(path: string): string[] | null;
                          getKeyValueAsElementArray(path: string): Kv3Element[] | null;
                          getIndices(meshIndex: number, bufferId: number): number[];
                          getVertices(meshIndex: number, bufferId: number): number[];
                          getNormalsTangents(meshIndex: number, bufferId: number): number[][];
                          getCoords(meshIndex: number, bufferId: number): number[];
                          getNormal(meshIndex: number, bufferId: number): number[];
                          getTangent(meshIndex: number, bufferId: number): number[];
                          getBoneIndices(meshIndex: number, bufferId: number): ArrayBuffer;
                          getBoneWeight(meshIndex: number, bufferId: number): number[];
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

                      export declare class Source2GrassTile extends Source2Material {
                          get shaderSource(): string;
                      }

                      export declare class Source2Hero extends Source2Material {
                          get shaderSource(): string;
                      }

                      export declare class Source2HeroFluid extends Source2Material {
                          get shaderSource(): string;
                      }

                      export declare class Source2IceSurfaceDotaMaterial extends Source2Material {
                          get shaderSource(): string;
                      }

                      export declare class Source2LifespanDecay extends Operator {
                          doOperate(particle: Source2Particle, elapsedTime: number, strength: number): void;
                      }

                      export declare class Source2LiquidFx extends Source2Material {
                          get shaderSource(): string;
                      }

                      export declare class Source2LockToBone extends Operator {
                          #private;
                          _paramChanged(paramName: string, param: OperatorParam): void;
                          doOperate(particle: Source2Particle | null | Source2Particle[], elapsedTime: number, strength: number): void;
                      }

                      export declare class Source2Material extends Material {
                          #private;
                          repository: string;
                          readonly shader: string;
                          constructor(repository: string, shader: string, source2File?: Source2File);
                          setupUniformsOnce(): void;
                          clone(): Source2Material;
                          getTextureParam(textureName: string): string | null;
                          updateMaterial(time: number, mesh: Mesh): void;
                          _afterProcessProxies(proxyParams: DynamicParams): void;
                          setDynamicUniform(uniformName: string): void;
                          afterProcessProxies(proxyParams: DynamicParams): void;
                          setUniform(uniformName: string, uniformValue: UniformValue): void;
                          initFloatUniforms(): void;
                          initVectorUniforms(): void;
                          getUniforms(): Map<string, string>[];
                          getTextureUniforms(): Map<string, [string, string]>[];
                          initTextureUniforms(): Promise<void>;
                          getIntParam(intName: string): number | null;
                          getIntParams(): Map<string, integer> | null;
                          getFloatParam(floatName: string): number | null;
                          getFloatParams(): Map<string, float> | null;
                          getVectorParam(vectorName: string, out: vec4): vec4 | null;
                          getVectorParams(): Map<string, vec4> | null;
                          getDynamicParam(name: string): vec4 | null;
                          getDecompiledDynamicParam(name: string): [string | null, Uint8Array] | null;
                          getDynamicParams(): Map<string, [string | null, Uint8Array]> | null;
                          getTextureParams(): Map<string, string> | null;
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
                          currentSheen: null;
                          animLayers: never[];
                          animGroups: Set<Source2AnimGroup>;
                          materialRepository: null;
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
                          getAnim(activityName: string, activityModifiers: Set<string>): Source2AnimationDesc | null;
                          getAnimation(name: string): Source2AnimationDesc | null;
                          getAnimationsByActivity(activityName: string, animations?: Source2Animations): Source2Animations;
                          getAnimations(): Promise<Set<string>>;
                          _addAttachments(attachments: Kv3Element[]): void;
                          getAnimationByName(animName: string): Source2AnimationDesc | undefined;
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
                          model: Source2ModelInstance;
                          attachment: Source2ModelAttachment;
                          constructor(model: Source2ModelInstance, attachment: Source2ModelAttachment);
                          getWorldPosition(vec?: vec3): vec3;
                          getWorldQuaternion(q?: quat): quat;
                      }

                      export declare class Source2ModelInstance extends Entity implements Animated, HasMaterials, HasSkeleton, RandomPointOnModel {
                          #private;
                          isSource2ModelInstance: boolean;
                          animable: boolean;
                          bodyParts: Record<string, Mesh[][]>;
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
                          resetBodyGroups(): void;
                          get skeleton(): Skeleton | null;
                          setPosition(position: vec3): void;
                          addChild(child: Entity): Entity | undefined;
                          removeChild(child: Entity): void;
                          set skin(skin: number);
                          get skin(): number;
                          setSkin(skin: string): Promise<void>;
                          setLOD(lod: number): void;
                          setPoseParameter(paramName: string, paramValue: number): void;
                          playSequence(activity: string, activityModifiers?: string[]): void;
                          playAnimation(name: string): void;
                          setAnimation(id: number, name: string, weight: number): Promise<void>;
                          setActivityModifiers(activityModifiers?: string[]): void;
                          update(scene: Scene, camera: Camera, delta: number): void;
                          getSkins(): Promise<Set<string>>;
                          getMaterialsName(skin: string): Promise<[string, Set<string>]>;
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
                              entitynull_1: null;
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
                              entitynull_2: null;
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
                              entitynull_3: null;
                              scale: {
                                  i18n: string;
                                  f: () => void;
                              };
                              reset_scale: {
                                  i18n: string;
                                  f: () => vec3;
                              };
                              entitynull_4: null;
                              wireframe: {
                                  i18n: string;
                                  selected: boolean;
                                  f: () => void;
                              };
                              cast_shadows: {
                                  i18n: string;
                                  selected: boolean | undefined;
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
                              Source2ModelInstance_1: null;
                              skin: {
                                  i18n: string;
                                  submenu: any[];
                              };
                              animation: {
                                  i18n: string;
                                  f: (entity: Source2ModelInstance) => Promise<void>;
                              };
                              Source2ModelInstance_2: null;
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
                          getRandomPointOnModel(vec: vec3, initialVec: vec3, bones: [Bone, number][]): vec3;
                          getAttachment(name: string): Source2ModelAttachmentInstance | undefined;
                          static set animSpeed(speed: number);
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
                          static createInstance(repository: string, fileName: string, dynamic: boolean): Promise<Source2ModelInstance | null>;
                          static loadManifest(repository: string): Promise<void>;
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

                      export declare class Source2Panorama extends Source2Material {
                          get shaderSource(): string;
                      }

                      export declare class Source2PanoramaFancyQuad extends Source2Material {
                          get shaderSource(): string;
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
                          setField(field: number | undefined, value: any, mulInitial?: boolean, setInitial?: boolean, additive?: boolean): void;
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
                          createParticle(emitterIndex: number, creationTime: number, elapsedTime: number): Source2Particle | undefined;
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
                          getParticle(index?: number): Source2Particle | undefined;
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
                              entitynull_1: null;
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
                              entitynull_2: null;
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
                              entitynull_3: null;
                              scale: {
                                  i18n: string;
                                  f: () => void;
                              };
                              reset_scale: {
                                  i18n: string;
                                  f: () => vec3;
                              };
                              entitynull_4: null;
                              wireframe: {
                                  i18n: string;
                                  selected: boolean;
                                  f: () => void;
                              };
                              cast_shadows: {
                                  i18n: string;
                                  selected: boolean | undefined;
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
                              Source2ParticleSystem_1: null;
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

                      export declare class Source2PhyscisWireframe extends Source2Material {
                          get shaderSource(): string;
                      }

                      export declare class Source2ProjectedDotaMaterial extends Source2Material {
                          get shaderSource(): string;
                      }

                      export declare class Source2RandomForce extends Operator {
                          #private;
                          _paramChanged(paramName: string, param: OperatorParam): void;
                          doForce(particle: Source2Particle, elapsedTime: number, accumulatedForces: vec3, strength: number): void;
                      }

                      export declare class Source2RefractMaterial extends Source2Material {
                          get shaderSource(): string;
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
                          getAnimationsByActivity(activityName: string): Source2AnimationDesc[];
                          getDecodeKey(): Kv3Element | undefined;
                          getDecoderArray(): Source2AnimeDecoder_2[];
                          get localSequenceNameArray(): string[] | null;
                      }

                      declare class Source2Sequence {
                          name: string;
                          fps: number;
                          frameCount: number;
                          activities: any;
                          animNames: any;
                          constructor(name: string, params?: any);
                          matchActivity(activity: string, modifiers: string[]): boolean | undefined;
                      }

                      export declare class Source2SetControlPointPositions extends Operator {
                          #private;
                          _paramChanged(paramName: string, param: OperatorParam): void;
                          doOperate(particle: Source2Particle | Source2Particle[] | undefined | null, elapsedTime: number, strength: number): void;
                          isPreEmission(): boolean;
                      }

                      export declare class Source2Sky extends Source2Material {
                          get shaderSource(): string;
                      }

                      declare class Source2Snapshot {
                          particleCount: number;
                          attributes: any;
                          file: Source2File | null;
                          setParticleCount(particleCount: number): void;
                      }

                      export declare const Source2SnapshotLoader: {
                          load(repository: string, filename: string): Promise<Source2Snapshot | null>;
                          "__#267@#loadSnapshot"(snapFile: Source2File): Source2Snapshot;
                      };

                      export declare class Source2SpringMeteor extends Source2Material {
                          get shaderSource(): string;
                      }

                      export declare class Source2SpriteCard extends Source2Material {
                          #private;
                          constructor(repository: string, shader?: string, source2File?: Source2File);
                          setOutputBlendMode(outputBlendMode: number): void;
                          setTexturePath(texturePath: string): Promise<void>;
                          initTextureUniforms(): Promise<void>;
                          getFrameSpan(sequence: number): number;
                          getShaderSource(): string;
                      }

                      export declare class Source2StickersMaterial extends Source2Material {
                          get shaderSource(): string;
                      }

                      declare class Source2Texture extends Source2File {
                          #private;
                          spriteSheet: SpriteSheet | null;
                          constructor(repository: string, path: string);
                          getAlphaBits(): number;
                          getWidth(): number;
                          getHeight(): number;
                          getDxtLevel(): number;
                          isCompressed(): boolean;
                          isCubeTexture(): boolean;
                          setImageFormat(imageFormat: VtexImageFormat): void;
                          getVtexImageFormat(): VtexImageFormat;
                          getImageFormat(): ImageFormat;
                          getImageData(mipmap?: number, frame?: number, face?: number): Promise<ImageData | null>;
                          setCodec(codec: TextureCodec): void;
                          decodeYCoCg(): boolean;
                          decodeNormalizeNormals(): boolean;
                          setSpecialDependency(compilerIdentifier: string, string: string): void;
                      }

                      export declare const Source2TextureManager: Source2TextureManagerClass;

                      declare class Source2TextureManagerClass {
                          #private;
                          WEBGL_compressed_texture_s3tc: any;
                          EXT_texture_compression_bptc: any;
                          EXT_texture_compression_rgtc: any;
                          constructor();
                          getTexture(repository: string, path: string, frame: number): Promise<Texture | null>;
                          getVtex(repository: string, path: string): Promise<Source2Texture | null>;
                          getTextureSheet(repository: string, path: string): Promise<SpriteSheet | null>;
                          setTexture(path: string, texture: AnimatedTexture): void;
                          fillTexture(imageFormat: ImageFormat, width: number, height: number, datas: ArrayBufferView | null, target: GLenum): void;
                          fillTextureDxt(texture: WebGLTexture, imageFormat: ImageFormat, width: number, height: number, datas: Uint8Array, target: GLenum): void;
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
                          load(repositoryName: string, fileName: string): Promise<Source2File | SourceMdl | SourceVvd | SourceVtx | SourceBSP | SourcePCF | Source1Vtf | null>;
                          parse(repository: string, fileName: string, arrayBuffer: ArrayBuffer): Promise<Source2File | any> | SourceVvd | SourceVtx | Source1Vtf | SourcePCF | SourceMdl | SourceBSP | null;
                      }

                      export declare class SourceBSP extends World {
                          #private;
                          readonly repository: string;
                          bspFileVersion: number;
                          lumps: SourceBSPLump[];
                          mapRevision: number;
                          loaded: boolean;
                          bufferInitialized: boolean;
                          staticGeometry: {};
                          skyBoxStaticGeometry: {};
                          skyboxGeometry: {};
                          overlayVerticesByTexture: {};
                          mainLightMap: SELightMapNode;
                          lightMapTexture: null;
                          skyCamera: MapEntity | null;
                          skyName: null;
                          entities: MapEntity[];
                          mapSpawn: boolean;
                          lastLeaf: undefined;
                          bspTree: Source1BspTree;
                          frameCount: number;
                          mustParseHeader: boolean;
                          funcBrushesRemoveMe: FuncBrush[];
                          partialLoading: boolean;
                          eventTarget: EventTarget;
                          staticProps: Group;
                          dynamicProps: Group;
                          mapFaces: Group;
                          constructor(params?: any);
                          initMap(): void;
                          addLump(lump: SourceBSPLump): void;
                          getLumpData(lumpType: number): LumpData | null;
                          addConnection(connection: MapEntityConnection): void;
                          getOBBSize(modelIndex: number): vec3 | null;
                          static getEntityName(): string;
                      }

                      /**
                       * BSP lump
                       * @param {Number} type The lump type
                       */
                      declare class SourceBSPLump extends SEBaseBspLump {
                          constructor(map: SourceBSP, type: number, reader: BinaryReader, offset: number, length: number);
                      }

                      declare class SourceBSPLumpBrush {
                          firstside: number;
                          numsides: number;
                          contents: number;
                      }

                      declare class SourceBSPLumpBrushSide {
                          planenum: number;
                          texinfo: number;
                          dispinfo: number;
                          bevel: number;
                      }

                      declare class SourceBSPLumpColorRGBExp32 {
                          readonly color: vec4;
                      }

                      declare class SourceBSPLumpDispInfo {
                          readonly startPosition: vec3;
                          dispVertStart: number;
                          dispTriStart: number;
                          power: number;
                          minTess: number;
                          smoothingAngle: number;
                          contents: number;
                          mapFace: number;
                          lightmapAlphaStart: number;
                          lightmapSamplePositionStart: number;
                          readonly allowedVerts: number[];
                      }

                      declare class SourceBSPLumpDispVertex {
                          readonly vec: vec3;
                          dist: number;
                          alpha: number;
                      }

                      declare class SourceBSPLumpEdge {
                          f: number;
                          s: number;
                      }

                      declare class SourceBSPLumpEntity {
                          str: string;
                          kv: KvReader;
                      }

                      declare class SourceBSPLumpFace {
                          initialized: boolean;
                          planenum: number;
                          side: number;
                          onNode: number;
                          firstedge: number;
                          numedges: number;
                          texinfo: number;
                          dispinfo: number;
                          surfaceFogVolumeID: number;
                          readonly styles: number[];
                          lightofs: number;
                          area: number;
                          readonly lightmapTextureMinsInLuxels: number[];
                          readonly lightmapTextureSizeInLuxels: number[];
                          origFace: number;
                          numPrims: number;
                          firstPrimID: number;
                          smoothingGroups: number;
                      }

                      /**
                       * BSP lump
                       * @param {Number} type The lump type
                       */
                      declare class SourceBSPLumpGameLump extends SEBaseBspLump {
                          id: string;
                          flags: number;
                          version: number;
                      }

                      declare class SourceBSPLumpLeaf {
                          contents: number;
                          cluster: number;
                          areaflags: number;
                          readonly mins: vec3;
                          readonly maxs: vec3;
                          firstleafface: number;
                          numleaffaces: number;
                          firstleafbrush: number;
                          numleafbrushes: number;
                          leafWaterDataID: number;
                          contains(position: vec3): boolean;
                      }

                      declare class SourceBSPLumpModel {
                          readonly position: vec3;
                          headnode: number;
                          firstface: number;
                          numfaces: number;
                      }

                      declare class SourceBSPLumpNode {
                          planenum: number;
                          readonly children: [number, number];
                          readonly mins: vec3;
                          readonly maxs: vec3;
                          firstface: number;
                          numfaces: number;
                          area: number;
                          contains(position: vec3): boolean;
                      }

                      declare class SourceBSPLumpOverlay {
                          id: number;
                          texInfo: number;
                          FaceCountAndRenderOrder: number;
                          readonly faces: Int32Array<ArrayBuffer>;
                          readonly u: [number, number];
                          readonly v: [number, number];
                          readonly uvPoint0: vec3;
                          readonly uvPoint1: vec3;
                          readonly uvPoint2: vec3;
                          readonly uvPoint3: vec3;
                          readonly origin: vec3;
                          readonly basisNormal: vec3;
                      }

                      declare class SourceBSPLumpPlane {
                          normal: vec3;
                          dist: number;
                          type: number;
                          constructor(normal: vec3, dist: number, type: number);
                      }

                      declare class SourceBSPLumpPropStatic {
                          readonly position: vec3;
                          readonly angles: vec3;
                          propType: number;
                          firstLeaf: number;
                          leafCount: number;
                          solid: number;
                          flags: number;
                          skin: number;
                          fadeMinDist: number;
                          fadeMaxDist: number;
                          readonly lightingOrigin: vec3;
                          forcedFadeScale: number;
                          minDXLevel: number;
                          maxDXLevel: number;
                          minCPULevel: number;
                          maxCPULevel: number;
                          minGPULevel: number;
                          maxGPULevel: number;
                          diffuseModulation: number;
                          disableX360: number;
                      }

                      declare class SourceBSPLumpPropStaticDirectory {
                          readonly name: string[];
                          readonly leaf: number[];
                          readonly props: SourceBSPLumpPropStatic[];
                      }

                      declare class SourceBSPLumpTexData {
                          reflectivity: vec3;
                          nameStringTableID: number;
                          width: number;
                          height: number;
                          view_width: number;
                          view_height: number;
                      }

                      declare class SourceBSPLumpTexInfo {
                          textureVecs: [vec4, vec4];
                          lightmapVecs: [vec4, vec4];
                          flags: number;
                          texdata: number;
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
                          loader: Source1MdlLoader;
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
                          pLinearBones?: never;
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
                          getAnimDescription(animIndex: number | null | undefined): MdlStudioAnimDesc | null;
                          getAnimFrame(dynamicProp: Source1ModelInstance, animDesc: MdlStudioAnimDesc, frameIndex: number): {
                              bones: Record<string, any>;
                          } | null;
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
                          readonly repository: string;
                          fileName: string;
                          name: string;
                          mdl: SourceMdl;
                          vvd: SourceVvd;
                          vtx: SourceVtx;
                          requiredLod: number;
                          drawBodyPart: {};
                          currentSkin: number;
                          currentSheen: null;
                          animLayers: never[];
                          materialRepository: null;
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

                      declare type SourceParticleFieldValue = any;

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
                          getSystem(systemName: string): Source1ParticleSystem | null;
                          initSystem(system: Source1ParticleSystem): Source1ParticleSystem | null;
                          addOperators(system: Source1ParticleSystem, list: CDmxAttributeValue[], listType: string): void;
                          addAttributes(operator: Source1ParticleOperator, list: CDmxAttribute[]): void;
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
                          constructor(params?: SphereParameters);
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
                              entitynull_1: null;
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
                              entitynull_2: null;
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
                              entitynull_3: null;
                              scale: {
                                  i18n: string;
                                  f: () => void;
                              };
                              reset_scale: {
                                  i18n: string;
                                  f: () => vec3;
                              };
                              entitynull_4: null;
                              wireframe: {
                                  i18n: string;
                                  selected: boolean;
                                  f: () => void;
                              };
                              cast_shadows: {
                                  i18n: string;
                                  selected: boolean | undefined;
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
                              Sphere_1: null;
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
                          raycast(raycaster: Raycaster, intersections: Intersection[]): void;
                          toJSON(): any;
                          static constructFromJSON(json: JSONObject, entities: Map<string, Entity | Material>, loadedPromise: Promise<void>): Promise<Sphere>;
                          static getEntityName(): string;
                      }

                      declare type SphereParameters = MeshParameters & {
                          radius?: number;
                          segments?: number;
                          rings?: number;
                          phiStart?: number;
                          phiLength?: number;
                          thetaStart?: number;
                          thetaLength?: number;
                          material?: Material;
                      };

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
                              entitynull_1: null;
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
                              entitynull_2: null;
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
                              entitynull_3: null;
                              scale: {
                                  i18n: string;
                                  f: () => void;
                              };
                              reset_scale: {
                                  i18n: string;
                                  f: () => vec3;
                              };
                              entitynull_4: null;
                              wireframe: {
                                  i18n: string;
                                  selected: boolean;
                                  f: () => void;
                              };
                              cast_shadows: {
                                  i18n: string;
                                  selected: boolean | undefined;
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
                              Light_1: null;
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
                          constructor(params?: MeshParameters);
                          update(): void;
                          parentChanged(parent?: Entity | null): void;
                      }

                      export declare class SpriteCardMaterial extends Source1Material {
                          #private;
                          constructor(repository: string, path: string, vmt: Source1MaterialVmt, params?: Source1MaterialParams);
                          init(): void;
                          clone(): SpriteCardMaterial;
                          get shaderSource(): string;
                      }

                      export declare class SpriteMaterial extends Source1Material {
                          #private;
                          constructor(repository: string, path: string, vmt: Source1MaterialVmt, params?: Source1MaterialParams);
                          init(): void;
                          clone(): SpriteMaterial;
                          get shaderSource(): string;
                      }

                      export declare class SpriteSheet {
                          readonly sequences: SpriteSheetSequence[];
                          addSequence(): SpriteSheetSequence;
                          getFrame(sequenceId: number, frame: number, channel?: number): SpriteSheetCoord | null;
                      }

                      export declare class SpriteSheetCoord {
                          uMin: number;
                          vMin: number;
                          uMax: number;
                          vMax: number;
                      }

                      export declare class SpriteSheetFrame {
                          readonly coords: SpriteSheetCoord[];
                          duration: number;
                          addCoord(): SpriteSheetCoord;
                      }

                      export declare class SpriteSheetSequence {
                          readonly frames: SpriteSheetFrame[];
                          duration: number;
                          clamp: boolean;
                          addFrame(): SpriteSheetFrame;
                          getFrame(frame: number, channel?: number): SpriteSheetCoord | null;
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
                          execute(variables: Map<string, Source1MaterialVariables>, proxyParams: DynamicParams, time: number): void;
                      }

                      export declare class StatTrakIllum extends Proxy_2 {
                          #private;
                          init(): void;
                          execute(variables: Map<string, Source1MaterialVariables>, proxyParams: DynamicParams, time: number): void;
                      }

                      export declare class StickybombGlowColor extends Proxy_2 {
                          #private;
                          init(): void;
                          execute(variables: Map<string, Source1MaterialVariables>, proxyParams: DynamicParams, time: number): void;
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
                          constructor(params?: Text3DParameters);
                          set text(text: string);
                          set size(size: number);
                          set depth(depth: number);
                          set font(font: string);
                          set style(style: string);
                          toJSON(): any;
                          static constructFromJSON(json: JSONObject, entities: Map<string, Entity | Material>, loadedPromise: Promise<void>): Promise<Text3D | null>;
                          fromJSON(json: JSONObject): void;
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
                              entitynull_1: null;
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
                              entitynull_2: null;
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
                              entitynull_3: null;
                              scale: {
                                  i18n: string;
                                  f: () => void;
                              };
                              reset_scale: {
                                  i18n: string;
                                  f: () => vec3;
                              };
                              entitynull_4: null;
                              wireframe: {
                                  i18n: string;
                                  selected: boolean;
                                  f: () => void;
                              };
                              cast_shadows: {
                                  i18n: string;
                                  selected: boolean | undefined;
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
                              Text3D_1: null;
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

                      declare type Text3DParameters = MeshParameters & {
                          text?: string;
                          size?: number;
                          depth?: number;
                          font?: string;
                          style?: string;
                      };

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
                          readonly defines: Map<string, string>;
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

                      declare enum TextureCodec {
                          YCoCg = 1,
                          NormalizeNormals = 2
                      }

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
                          inputTexture: Texture | null;
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
                          static createFlatTexture(color?: Color, needCubeMap?: boolean): Texture;
                          static createCheckerTexture(color?: Color, width?: number, height?: number, needCubeMap?: boolean): Texture;
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
                          init(variables: Map<string, Source1MaterialVariables>): void;
                          execute(variables: Map<string, Source1MaterialVariables>, proxyParams: DynamicParams, time: number): void;
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
                          centerVar: string;
                          translateVar: string;
                          rotateVar: string;
                          scaleVar: string;
                          resultVar: string;
                          init(variables: Map<string, Source1MaterialVariables>): void;
                          execute(variables: Map<string, Source1MaterialVariables>, proxyParams: DynamicParams, time: number): void;
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

                      export declare class TrailLengthRandom extends Source1ParticleOperator {
                          static functionName: string;
                          constructor(system: Source1ParticleSystem);
                          doInit(particle: Source1Particle, elapsedTime: number): void;
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
                              entitynull_1: null;
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
                              entitynull_2: null;
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
                              entitynull_3: null;
                              scale: {
                                  i18n: string;
                                  f: () => void;
                              };
                              reset_scale: {
                                  i18n: string;
                                  f: () => vec3;
                              };
                              entitynull_4: null;
                              wireframe: {
                                  i18n: string;
                                  selected: boolean;
                                  f: () => void;
                              };
                              cast_shadows: {
                                  i18n: string;
                                  selected: boolean | undefined;
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
                              TranslationControl_1: null;
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

                      export declare class TwistAroundAxis extends Source1ParticleOperator {
                          static functionName: string;
                          constructor(system: Source1ParticleSystem);
                          doForce(particle: Source1Particle, elapsedTime: number, accumulatedForces: vec3, strength?: number): void;
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
                          execute(variables: Map<string, Source1MaterialVariables>, proxyParams: DynamicParams, time: number): void;
                      }

                      declare type UniformValue = boolean | number | boolean[] | number[] | vec2 | vec3 | vec4 | Texture | Texture[] | null;

                      export declare class UnlitGenericMaterial extends Source1Material {
                          #private;
                          constructor(repository: string, path: string, vmt: Source1MaterialVmt, params?: Source1MaterialParams);
                          init(): void;
                          clone(): UnlitGenericMaterial;
                          get shaderSource(): string;
                      }

                      export declare class UnlitTwoTextureMaterial extends Source1Material {
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

                      export declare class VelocityNoise extends Source1ParticleOperator {
                          #private;
                          static functionName: string;
                          constructor(system: Source1ParticleSystem);
                          doInit(particle: Source1Particle, elapsedTime: number): void;
                          initMultipleOverride(): boolean;
                      }

                      export declare class VelocityRandom extends Source1ParticleOperator {
                          static functionName: string;
                          constructor(system: Source1ParticleSystem);
                          doInit(particle: Source1Particle, elapsedTime: number): void;
                          initMultipleOverride(): boolean;
                      }

                      export declare class VertexLitGenericMaterial extends Source1Material {
                          #private;
                          useSrgb: boolean;
                          init(): void;
                          afterProcessProxies(proxyParams: DynamicParams): void;
                          clone(): VertexLitGenericMaterial;
                          get shaderSource(): string;
                      }

                      declare type Viewport = {
                          x: number;
                          y: number;
                          width: number;
                          height: number;
                      };

                      declare type VmtParameter = [
                      typeof SHADER_PARAM_TYPE_TEXTURE | typeof SHADER_PARAM_TYPE_INTEGER | typeof SHADER_PARAM_TYPE_COLOR | typeof SHADER_PARAM_TYPE_VEC2 | typeof SHADER_PARAM_TYPE_VEC3 | typeof SHADER_PARAM_TYPE_VEC4 | typeof SHADER_PARAM_TYPE_ENVMAP | typeof SHADER_PARAM_TYPE_FLOAT | typeof SHADER_PARAM_TYPE_BOOL | typeof SHADER_PARAM_TYPE_FOURCC | typeof SHADER_PARAM_TYPE_MATRIX | typeof SHADER_PARAM_TYPE_MATERIAL | typeof SHADER_PARAM_TYPE_STRING | typeof SHADER_PARAM_TYPE_MATRIX4X2,
                      any
                      ];

                      declare type VmtParameters = Record<string, VmtParameter>;

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

                      declare enum VtexImageFormat {
                          Unknown = 0,
                          Dxt1 = 1,
                          Dxt5 = 2,
                          R8 = 3,
                          R8G8B8A8Uint = 4,
                          PngR8G8B8A8Uint = 16,
                          PngDXT5 = 18,
                          Bc7 = 20,
                          Bc5 = 21,
                          Bc4 = 27,
                          BGRA8888 = 28
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

                      export declare class WaterMaterial extends Source1Material {
                          #private;
                          init(): void;
                          clone(): WaterMaterial;
                          getShaderSource(): string;
                      }

                      export declare class WeaponDecalMaterial extends Source1Material {
                          #private;
                          init(): void;
                          afterProcessProxies(proxyParams: DynamicParams): void;
                          set style(style: string);
                          setColorUniform(uniformName: string, value: string): void;
                          set color0(color: string);
                          set color1(color: string);
                          set color2(color: string);
                          set color3(color: string);
                          setPatternTexCoordTransform(scale: vec2, translation: vec2, rotation: number): void;
                          getDefaultParameters(): VmtParameters;
                          clone(): WeaponDecalMaterial;
                          get shaderSource(): string;
                      }

                      export declare class WeaponInvis extends Proxy_2 {
                      }

                      export declare class WeaponLabelText extends Proxy_2 {
                          #private;
                          init(): void;
                          execute(variables: Map<string, Source1MaterialVariables>, proxyParams: DynamicParams, time: number): void;
                      }

                      export declare class WeaponSkin extends Proxy_2 {
                          #private;
                          execute(variables: Map<string, Source1MaterialVariables>, proxyParams: DynamicParams, time: number): void;
                      }

                      declare type WebGLAnyRenderingContext = WebGLRenderingContext | WebGL2RenderingContext;

                      export declare class WebGLRenderingState {
                          #private;
                          static setGraphics(): void;
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

                      export declare class WorldVertexTransitionMaterial extends Source1Material {
                          #private;
                          init(): void;
                          afterProcessProxies(proxyParams: DynamicParams): void;
                          clone(): WorldVertexTransitionMaterial;
                          getShaderSource(): string;
                      }

                      export declare class YellowLevel extends Proxy_2 {
                          #private;
                          init(): void;
                          execute(variables: Map<string, Source1MaterialVariables>, proxyParams: DynamicParams, time: number): void;
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
                          "__#236@#webAssembly"?: any;
                          "__#236@#HEAPU8"?: Uint8Array;
                          decompress(compressedDatas: Uint8Array): Promise<Uint8Array<ArrayBuffer> | null>;
                          decompress_ZSTD(compressedDatas: Uint8Array, uncompressedDatas: Uint8Array): Promise<any>;
                          getWebAssembly(): Promise<any>;
                          "__#236@#initHeap"(): void;
                      };

                      export { }
