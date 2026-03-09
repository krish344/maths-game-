import { Canvas } from '@react-three/fiber'
import { OrbitControls, Box } from '@react-three/drei'

export default function GamePreview() {
  return (
    <div className="preview-card">
      <Canvas camera={{ position: [0, 2, 6], fov: 60 }}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[3, 4, 2]} intensity={1} />

        <Box args={[6, 0.3, 20]} position={[0, -1.2, 0]}>
          <meshStandardMaterial color="#334155" />
        </Box>

        <Box args={[1, 1, 1]} position={[-1.5, -0.4, -2]}>
          <meshStandardMaterial color="#38bdf8" />
        </Box>
        <Box args={[1.2, 1.2, 1.2]} position={[1.2, -0.2, -6]}>
          <meshStandardMaterial color="#6366f1" />
        </Box>

        <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 2.1} minDistance={4} maxDistance={9} />
      </Canvas>
      <div className="preview-overlay">Linear 3D Obby Preview</div>
    </div>
  )
}
