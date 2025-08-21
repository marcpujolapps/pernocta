"use client";

import { ResultsHeader } from "@/components/results-header"
import { ResultsLayout } from "@/components/results-layout"
import { Footer } from "@/components/footer"
import { Suspense, useState, useCallback } from "react"

export default function ResultsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const [resultsCount, setResultsCount] = useState<number>(0)
  
  const handleResultsCount = useCallback((count: number) => {
    setResultsCount(count)
  }, [])

  return (
    <main className="min-h-screen bg-background">
      <ResultsHeader searchParamsPromise={searchParams} resultsCount={resultsCount} />
      <Suspense fallback={<div className="h-screen flex items-center justify-center">Carregant resultats...</div>}>
        <ResultsLayout searchParamsPromise={searchParams} onResultsCount={handleResultsCount} />
      </Suspense>
      <Footer />
    </main>
  )
}
