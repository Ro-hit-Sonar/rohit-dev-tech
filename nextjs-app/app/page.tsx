import { Suspense } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Code, Brain, Zap } from "lucide-react";

import { AllPosts } from "@/app/components/Posts";
import GetStartedCode from "@/app/components/GetStartedCode";

export default async function Page() {
  return (
    <>
      {/* Enhanced Hero Section */}
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Improved background gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-white to-blue-50"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-red-100/30 via-transparent to-blue-100/30"></div>

        {/* Subtle animated background elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-red-300 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse animation-delay-4000"></div>

        {/* Main content */}
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            {/* Enhanced badge */}
            <div className="inline-flex items-center px-6 py-3 rounded-full bg-red-100 text-red-800 text-sm font-medium mb-8 shadow-sm border border-red-200">
              <BookOpen className="w-4 h-4 mr-2" />
              Welcome to my tech blog
            </div>

            {/* Enhanced main heading */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tighter mb-8">
              <Link
                className="text-red-600 hover:text-red-700 transition-colors duration-300 relative group"
                href="/about"
              >
                Rohit
                <span className="absolute -bottom-2 left-0 w-0 h-1 bg-red-600 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <span className="text-gray-900 mx-4">+</span>
              <Link
                className="text-gray-900 hover:text-gray-700 transition-colors duration-300 relative group"
                href="/posts"
              >
                Tech
                <span className="absolute -bottom-2 left-0 w-0 h-1 bg-gray-900 group-hover:w-full transition-all duration-300"></span>
              </Link>
            </h1>

            {/* Enhanced subtitle */}
            <p className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed">
              rohitdev.tech is a space where I simplify the complex. From system
              design and DevOps to computer science and AI, I break things down
              so they actually make sense. This isn&apos;t just a blog—it&apos;s
              my ongoing effort to learn, share, and explain clearly.
            </p>

            {/* Feature highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
              <div className="group flex items-center justify-center p-6 rounded-2xl bg-white/70 backdrop-blur-sm border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="text-center">
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-red-200 transition-colors">
                    <Code className="w-6 h-6 text-red-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    System Design
                  </h3>
                  <p className="text-sm text-gray-600">
                    Architecture & Patterns
                  </p>
                </div>
              </div>
              <div className="group flex items-center justify-center p-6 rounded-2xl bg-white/70 backdrop-blur-sm border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="text-center">
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-red-200 transition-colors">
                    <Zap className="w-6 h-6 text-red-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">DevOps</h3>
                  <p className="text-sm text-gray-600">
                    CI/CD & Infrastructure
                  </p>
                </div>
              </div>
              <div className="group flex items-center justify-center p-6 rounded-2xl bg-white/70 backdrop-blur-sm border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="text-center">
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-red-200 transition-colors">
                    <Brain className="w-6 h-6 text-red-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">AI & ML</h3>
                  <p className="text-sm text-gray-600">Machine Learning</p>
                </div>
              </div>
            </div>

            {/* Enhanced CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/posts"
                className="group inline-flex items-center px-8 py-4 bg-red-600 text-white font-semibold rounded-full hover:bg-red-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <span>Explore Articles</span>
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/about"
                className="group inline-flex items-center px-8 py-4 bg-white text-gray-900 font-semibold rounded-full border-2 border-gray-200 hover:border-gray-300 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <span>About Me</span>
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center animate-bounce">
            <div className="w-1 h-3 bg-gray-400 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Posts Section */}
      <div className="border-t border-gray-200 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <aside className="py-16 sm:py-24">
            <Suspense>{await AllPosts()}</Suspense>
          </aside>
        </div>
      </div>
    </>
  );
}
