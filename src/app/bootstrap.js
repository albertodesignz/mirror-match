'use client'

import { useEffect } from 'react'

export const BootstrapClient = () => {
  useEffect(() => {
    // Import Bootstrap JS only on the client side
    try {
      require('bootstrap/dist/js/bootstrap.bundle.min.js')
      console.log('Bootstrap JS loaded')
    } catch (error) {
      console.error('Error loading Bootstrap JS:', error)
    }
  }, [])
  
  return null
} 