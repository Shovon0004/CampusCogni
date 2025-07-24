"use client"

import { useState, useCallback } from 'react'
import { AnimationVariant, AnimationStart } from './theme-animations'

const VARIANTS: AnimationVariant[] = ['circle', 'circle-blur', 'polygon']
const STARTS: AnimationStart[] = ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'center']

export function useRandomThemeAnimation() {
  const [currentAnimation, setCurrentAnimation] = useState<{
    variant: AnimationVariant
    start: AnimationStart
  }>({
    variant: 'circle-blur',
    start: 'center'
  })

  const getRandomAnimation = useCallback(() => {
    const randomVariant = VARIANTS[Math.floor(Math.random() * VARIANTS.length)]
    let randomStart = STARTS[Math.floor(Math.random() * STARTS.length)]
    
    // If polygon variant, avoid center start as it's not supported
    if (randomVariant === 'polygon' && randomStart === 'center') {
      randomStart = 'top-left'
    }

    const newAnimation = {
      variant: randomVariant,
      start: randomStart
    }
    
    setCurrentAnimation(newAnimation)
    return newAnimation
  }, [])

  return {
    currentAnimation,
    getRandomAnimation
  }
}
