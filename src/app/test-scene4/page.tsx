'use client'

import dynamic from 'next/dynamic'

const Scene4 = dynamic(() => import('@/components/canvas/Scene4'), {
  ssr: false,
  loading: () => <div className="h-[100vh] bg-[#0D0D0D]" />,
})

export default function TestScene4Page() {
  // We return only the scene, not a full <main> element with minHeight.
  // This ensures it integrates smoothly into the main page flow.
  return <Scene4 />
}
