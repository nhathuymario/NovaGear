import {Component, Suspense, useEffect, useMemo, useState, type ErrorInfo, type ReactNode} from "react"
import {Canvas} from "@react-three/fiber"
import {Float, OrbitControls, useGLTF} from "@react-three/drei"
import * as THREE from "three"

const iphoneModelUrl = new URL("../../assets/iphone_17_pro_max.glb", import.meta.url).href

type ModelErrorBoundaryProps = {
    onError: () => void
    children: ReactNode
}

type ModelErrorBoundaryState = {
    hasError: boolean
}

class ModelErrorBoundary extends Component<ModelErrorBoundaryProps, ModelErrorBoundaryState> {
    state: ModelErrorBoundaryState = {hasError: false}

    static getDerivedStateFromError(): ModelErrorBoundaryState {
        return {hasError: true}
    }

    componentDidCatch(_error: Error, _errorInfo: ErrorInfo) {
        this.props.onError()
    }

    render() {
        if (this.state.hasError) return null
        return this.props.children
    }
}

function IphoneModel({onLoaded}: {onLoaded: () => void}) {
    const {scene} = useGLTF(iphoneModelUrl)
    const model = useMemo(() => scene.clone(), [scene])

    useEffect(() => {
        onLoaded()
        model.traverse((child: THREE.Object3D) => {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true
                child.receiveShadow = true
            }
        })
    }, [model, onLoaded])

    return <primitive object={model} position={[0, -1.1, 0]} scale={2.05} />
}

function StaticFallback() {
    return (
        <div className="flex h-full min-h-[320px] flex-col justify-between rounded-[30px] border border-white/15 bg-white/8 p-5 text-white shadow-2xl backdrop-blur">
            <div>
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/60">iPhone preview</p>
                <h3 className="mt-3 text-2xl font-black">NovaGear Showcase</h3>
                <p className="mt-2 text-sm text-slate-200">
                    Model 3D chưa tải được. Giao diện vẫn giữ bố cục premium và sẽ hiển thị an toàn trên mọi thiết bị.
                </p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                    ["Image", "Responsive"],
                    ["Model", "GLB"],
                    ["Fallback", "Accessible"],
                    ["GPU", "Friendly"],
                ].map(([value, label]) => (
                    <div key={label} className="rounded-2xl border border-white/10 bg-white/10 p-3">
                        <p className="text-xl font-black text-brand-yellow">{value}</p>
                        <p className="text-xs text-white/70">{label}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default function TechShowcase3D() {
    const [modelError, setModelError] = useState(false)
    const [isModelReady, setIsModelReady] = useState(false)

    if (modelError) {
        return <StaticFallback />
    }

    return (
        <div className="relative h-full min-h-[320px] overflow-hidden rounded-[30px] border border-white/15 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 shadow-2xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.25),transparent_45%),radial-gradient(circle_at_bottom,rgba(245,158,11,0.18),transparent_40%)]" />
            <div className="absolute left-4 top-4 z-10 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-white/70 backdrop-blur">
                NovaGear iPhone
            </div>
            <div className="relative z-0 flex h-full min-h-[320px] items-center justify-center px-6 py-8">
                {!isModelReady && (
                    <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold uppercase tracking-[0.24em] text-white/65">
                        Loading 3D model...
                    </div>
                )}
                <ModelErrorBoundary onError={() => setModelError(true)}>
                    <Canvas shadows camera={{position: [0, 0.4, 4.5], fov: 34}} className="h-full w-full">
                        <ambientLight intensity={1} />
                        <directionalLight position={[3, 5, 4]} intensity={2.2} castShadow />
                        <pointLight position={[-2, 1, 2]} intensity={0.9} color="#7dd3fc" />
                        <Suspense fallback={null}>
                            <Float speed={1.15} rotationIntensity={0.18} floatIntensity={0.45}>
                                <IphoneModel onLoaded={() => setIsModelReady(true)} />
                            </Float>
                        </Suspense>
                        <OrbitControls enablePan={false} enableZoom={false} autoRotate autoRotateSpeed={0.9} />
                    </Canvas>
                </ModelErrorBoundary>
            </div>
            <div className="absolute bottom-4 left-4 right-4 rounded-2xl border border-white/10 bg-slate-950/50 p-4 text-white backdrop-blur">
                <p className="text-sm font-semibold text-white/80">Mở rộng trải nghiệm mua sắm</p>
            </div>
        </div>
    )
}

useGLTF.preload(iphoneModelUrl)

