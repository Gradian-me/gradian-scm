"use client"

import type React from "react"
import Image from 'next/image'
import { useEffect } from "react"
import { useLanguage } from "@/components/ui/hooks/use-language"
import { useDocumentTitle } from "@/lib/hooks/use-document-title"
import { BackgroundDecoration } from "@/components/layout"
import { LoginForm } from "@/components/auth"
import { removeAuthToken, verifyAuthDataCleared } from "@/lib/utils/auth"
import { useAuthStore } from "@/components/auth/store/auth-store"
import { logger } from "@/lib/utils/logger"

export default function Login() {
  const { getKeyword } = useLanguage()
  const authStore = useAuthStore()

  useDocumentTitle({ 
    title: { 
      title: "ورود", 
      title_2: "Login", 
      title_3: "تسجيل الدخول",
      title_4: "Login"
    } 
  })

  // Clear all authentication data when login page loads
  useEffect(() => {
    logger.info('Login page loaded, clearing all authentication data', { 
      prefix: 'LoginPage'
    })
    
    // Clear localStorage auth data
    removeAuthToken()
    
    // Reset auth store to initial state
    authStore.resetAuthState()
    
    // Verify cleanup was successful
    const isCleared = verifyAuthDataCleared()
    logger.info('Authentication data cleanup completed', { 
      prefix: 'LoginPage',
      data: { isCleared }
    })
  }, []) // Empty dependency array - only run once on mount

  return (
    <div className="h-full w-full flex">
      <BackgroundDecoration />
      {/* Left Panel - Inspirational */}
      <div className="hidden lg:flex lg:w-1/2 p-8">
        <div className="w-full h-full rounded-2xl border border-white/20 overflow-hidden relative group">
          <div className="absolute inset-0">
            <Image
              src="/media/background-2.png"
              alt="Inspirational background"
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-pink-900/30 to-blue-900/20" />
          </div>

          <div className="relative z-10 flex flex-col justify-center p-12 text-white">
            <div className="max-w-md">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-0.5 bg-white/60"></div>
                <span className="text-sm font-medium tracking-wider uppercase opacity-80">
                  {getKeyword('gradianApp')}
                </span>
              </div>

              <h1 className="text-3xl lg:text-4xl font-bold mb-6" style={{ lineHeight: '1.6' }}>
                {getKeyword('analyticalPlatform')}
              </h1>

              <p className="text-lg opacity-90 leading-loose">
                {getKeyword('gradianMission')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-lg bg-background/80 backdrop-blur-sm rounded-3xl p-4 md:p-8 shadow-2xl">
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
