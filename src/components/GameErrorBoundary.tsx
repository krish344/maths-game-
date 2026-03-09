import React from 'react'

type Props = { children: React.ReactNode }
type State = { hasError: boolean }

export default class GameErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: unknown) {
    console.error('Game render error:', error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="mini-game">
          <h3>3D game couldn't load on this device</h3>
          <p>Please try Math Sprint or Fraction Pick, or refresh with hardware acceleration enabled.</p>
        </div>
      )
    }

    return this.props.children
  }
}
