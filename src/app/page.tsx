"use client";

import { useState } from "react";
import { GitBranch, Code2, Sparkles, ArrowRight, Loader2, CheckCircle2, AlertTriangle, BugIcon, BookOpen, Wand2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ReactMarkdown from "react-markdown";

interface Bug {
  line: string;
  description: string;
}

interface Fix {
  description: string;
  code: string;
}

interface ReviewData {
  score: number;
  bugs: Bug[];
  fixes: Fix[];
  docs: string;
  originalCode: string;
}

export default function Home() {
  const [code, setCode] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [review, setReview] = useState<ReviewData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  
  const handleReview = async (type: "code" | "github") => {
    setIsLoading(true);
    setError(null);
    setReview(null);
    
    try {
      const payload = type === "code" ? { code } : { githubUrl };
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Something went wrong fetching the review.");
      }
      
      setReview(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-12 md:py-24 flex flex-col items-center">
      <AnimatePresence mode="wait">
        {!review ? (
          <motion.div
            key="input-view"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="w-full flex flex-col items-center"
          >
            {/* Hero Section */}
            <div className="text-center space-y-6 mb-12">
              <div className="inline-flex items-center justify-center px-4 py-2 bg-primary/10 rounded-full mb-4 border border-primary/20 backdrop-blur-sm">
                <Sparkles className="w-4 h-4 text-primary mr-2" />
                <span className="text-sm font-semibold tracking-tight text-primary">Senior-Level AI Code Review 24/7</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-white via-slate-200 to-white/30">
                Ship better code, <br className="hidden md:block" />
                <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/50">faster than ever.</span>
              </h1>
              <p className="text-lg text-muted-foreground/80 max-w-2xl mx-auto leading-relaxed">
                Paste your code snippet or drop a GitHub file link. Our advanced AI will find bugs, suggest optimal fixes, rate the quality, and generate comprehensive documentation.
              </p>
            </div>

            <div className="w-full max-w-3xl">
              <Card className="border-border/40 bg-card/40 backdrop-blur-2xl shadow-2xl overflow-hidden ring-1 ring-white/5 transition-all hover:shadow-primary/5">
                <Tabs defaultValue="paste" className="w-full">
                  <CardHeader className="border-b border-border/40 pb-0 bg-black/20">
                    <TabsList className="w-full justify-start rounded-none border-none bg-transparent h-14 p-0">
                      <TabsTrigger 
                        value="paste" 
                        className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-6 pb-4 pt-4 font-medium transition-all"
                      >
                        <Code2 className="w-4 h-4 mr-2" />
                        Paste Code
                      </TabsTrigger>
                      <TabsTrigger 
                        value="github" 
                        className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-6 pb-4 pt-4 font-medium transition-all"
                      >
                        <GitBranch className="w-4 h-4 mr-2" />
                        GitHub URL
                      </TabsTrigger>
                    </TabsList>
                  </CardHeader>
                  <CardContent className="pt-6 pb-8 px-6 md:px-8 bg-gradient-to-b from-transparent to-black/10">
                    
                    {error && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start text-destructive"
                      >
                        <AlertTriangle className="w-5 h-5 mr-3 shrink-0 mt-0.5" />
                        <p className="text-sm">{error}</p>
                      </motion.div>
                    )}

                    <TabsContent value="paste" className="mt-0 space-y-6 outline-none">
                      <Textarea 
                        placeholder="Paste your React component or Python script here..." 
                        className="min-h-[320px] font-mono text-sm resize-y bg-black/40 border-border/40 focus-visible:ring-primary/50 placeholder:text-muted-foreground/30 rounded-lg p-4 leading-relaxed ring-1 ring-white/5 transition-all outline-none"
                        spellCheck={false}
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                      />
                      <div className="flex justify-end">
                        <Button 
                          size="lg" 
                          className="w-full md:w-auto font-semibold rounded-full px-8 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-95"
                          onClick={() => handleReview("code")}
                          disabled={isLoading || !code.trim()}
                        >
                          {isLoading ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing Code...</>
                          ) : (
                            <>Review Code <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" /></>
                          )}
                        </Button>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="github" className="mt-0 space-y-6 outline-none">
                      <div className="space-y-3">
                        <div className="relative">
                          <Input 
                            placeholder="https://github.com/user/repo/blob/main/src/index.js" 
                            className="h-14 bg-black/40 border-border/40 focus-visible:ring-primary/50 text-base px-4 rounded-lg placeholder:text-muted-foreground/30 ring-1 ring-white/5 transition-all outline-none"
                            value={githubUrl}
                            onChange={(e) => setGithubUrl(e.target.value)}
                          />
                        </div>
                        <p className="text-sm text-muted-foreground/70 px-1">
                          Paste the direct URL to a specific file in a public repository.
                        </p>
                      </div>
                      <div className="flex justify-end">
                        <Button 
                          size="lg" 
                          className="w-full md:w-auto font-semibold rounded-full px-8 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-95"
                          onClick={() => handleReview("github")}
                          disabled={isLoading || !githubUrl.trim()}
                        >
                          {isLoading ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Fetching & Analyzing...</>
                          ) : (
                            <>Analyze File <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" /></>
                          )}
                        </Button>
                      </div>
                    </TabsContent>
                  </CardContent>
                </Tabs>
              </Card>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="dashboard-view"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full space-y-8"
          >
            {/* Header & Score */}
            <div className="flex flex-col md:flex-row gap-6 items-center justify-between p-6 bg-card/40 border border-border/40 backdrop-blur-xl rounded-2xl ring-1 ring-white/5 shadow-xl transition-all hover:bg-card/50">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-primary/10 rounded-2xl border border-primary/20 shadow-inner">
                  <CheckCircle2 className="w-10 h-10 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold tracking-tight text-white uppercase tracking-wider">Analysis Complete</h2>
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  </div>
                  <p className="text-muted-foreground text-sm opacity-80">Our AI has thoroughly reviewed your code for inconsistencies and bugs.</p>
                </div>
              </div>
              <div className="flex items-center gap-4 group">
                <div className="text-right">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Quality Score</p>
                  <p className="text-xs text-muted-foreground/60 italic">Out of 100 points</p>
                </div>
                <div className={`flex items-center justify-center w-24 h-24 rounded-full border-4 shadow-xl transition-transform group-hover:scale-105 ${review.score >= 80 ? 'border-green-500 text-green-500 shadow-green-500/10' : review.score >= 50 ? 'border-yellow-500 text-yellow-500 shadow-yellow-500/10' : 'border-destructive text-destructive shadow-destructive/10'}`}>
                  <span className="text-3xl font-black">{review.score}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Bugs & Fixes */}
              <div className="lg:col-span-2 space-y-8">
                
                {/* Bugs Section */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <BugIcon className="w-5 h-5 text-destructive" />
                    <h3 className="text-xl font-bold text-white uppercase tracking-tight">Detected Bugs ({review.bugs?.length || 0})</h3>
                  </div>
                  {review.bugs && review.bugs.length > 0 ? (
                    <div className="grid gap-4">
                      {review.bugs.map((bug, i) => (
                        <Card key={i} className="border-destructive/20 bg-destructive/5 shadow-none ring-1 ring-destructive/10 cursor-default transition-all hover:bg-destructive/10 hover:border-destructive/30">
                          <CardContent className="p-4 flex gap-4">
                            <div className="px-3 py-1 bg-destructive/20 text-destructive text-xs font-mono font-bold rounded-full h-fit self-start whitespace-nowrap shadow-sm border border-destructive/20">
                              Line {bug.line || "N/A"}
                            </div>
                            <p className="text-sm text-destructive-foreground font-medium leading-relaxed">{bug.description}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card className="border-border/40 bg-card/40 backdrop-blur-sm border-dashed">
                      <CardContent className="p-10 text-center flex flex-col items-center gap-3">
                        <CheckCircle2 className="w-8 h-8 text-green-500" />
                        <p className="text-muted-foreground font-medium">No major bugs found! Your code follows best practices.</p>
                      </CardContent>
                    </Card>
                  )}
                </section>

                {/* Fixes Section */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Wand2 className="w-5 h-5 text-primary" />
                    <h3 className="text-xl font-bold text-white uppercase tracking-tight">Suggested Optimizations ({review.fixes?.length || 0})</h3>
                  </div>
                  {review.fixes && review.fixes.length > 0 ? (
                    <div className="space-y-6">
                      {review.fixes.map((fix, i) => (
                        <Card key={i} className="border-border/20 bg-[#0d1117] shadow-xl overflow-hidden ring-1 ring-white/10 transition-all hover:ring-primary/30">
                          <CardHeader className="bg-white/5 py-3 px-5 border-b border-white/10 flex flex-row items-center justify-between">
                            <CardTitle className="text-sm text-slate-300 font-semibold italic flex items-center gap-2">
                              {fix.description}
                            </CardTitle>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 px-2 text-muted-foreground hover:text-white hover:bg-white/10"
                              onClick={() => copyToClipboard(fix.code, i)}
                            >
                              {copiedIndex === i ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                            </Button>
                          </CardHeader>
                          <CardContent className="p-0 text-sm overflow-x-auto">
                            <SyntaxHighlighter
                              language="javascript"
                              style={vscDarkPlus}
                              customStyle={{ margin: 0, padding: '1.5rem', background: 'transparent', fontSize: '0.85rem' }}
                              wrapLines={true}
                            >
                              {fix.code || "// Unspecified code change"}
                            </SyntaxHighlighter>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card className="border-border/40 bg-card/40 border-dashed">
                      <CardContent className="p-10 text-center text-muted-foreground">
                        No fixes suggested. The current implementation is optimal.
                      </CardContent>
                    </Card>
                  )}
                </section>
              </div>

              {/* Right Column: Docs */}
              <div className="lg:col-span-1">
                <div className="sticky top-8 space-y-6">
                  <section className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen className="w-5 h-5 text-cyan-400" />
                      <h3 className="text-xl font-bold text-white uppercase tracking-tight font-heading">Documentation</h3>
                    </div>
                    <Card className="border-border/40 bg-card/40 backdrop-blur-xl ring-1 ring-white/5 shadow-2xl">
                      <CardContent className="p-6">
                        <div className="prose prose-invert prose-sm max-w-none text-muted-foreground/90 selection:bg-primary/30 prose-headings:text-white prose-a:text-primary prose-code:text-primary prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10">
                          {review.docs ? (
                            <ReactMarkdown>{review.docs}</ReactMarkdown>
                          ) : (
                            <div className="flex flex-col items-center justify-center py-10 opacity-50">
                              <Loader2 className="w-6 h-6 animate-spin mb-2" />
                              <p className="text-sm italic">Generating report...</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </section>
                  
                  <div className="flex flex-col gap-3 pt-4">
                    <Button 
                      variant="default" 
                      className="w-full font-bold shadow-lg shadow-primary/10 transition-all hover:shadow-primary/20"
                      onClick={() => setReview(null)}
                    >
                      Start New Analysis
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full text-xs font-semibold uppercase tracking-widest opacity-60 hover:opacity-100"
                      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    >
                      Back to Top
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
