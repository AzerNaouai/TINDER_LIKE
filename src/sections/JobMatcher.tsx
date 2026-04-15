import { useState, useEffect, useMemo } from 'react';
import { useMockData } from '@/hooks/useMockData';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  X,
  Heart,
  MapPin,
  DollarSign,
  Briefcase,
  Building2,
  TrendingUp,
  Code,
  CheckCircle,
  Star,
  RotateCcw,
  Info,
  Send,
  Bookmark,
  SlidersHorizontal,
} from 'lucide-react';
import { Job, JobMatch } from '@/types';

interface SwipedJob {
  jobId: string;
  liked: boolean;
  timestamp: Date;
}

export function JobMatcher() {
  const { jobs, profile, swipedJobs, companies, getJobMatches, swipeJob, undoSwipe, applyToJob, applications } = useMockData();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [localSwipedJobs, setLocalSwipedJobs] = useState<SwipedJob[]>([]);
  const [showDetail, setShowDetail] = useState<Job | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState('discover');
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    remote: false,
    hybrid: false,
    jobTypes: [] as string[],
    experienceLevels: [] as string[],
    salaryMin: 0,
    salaryMax: 200000,
  });

  // Combine global swiped jobs with local ones
  const allSwipedJobs = useMemo(() => {
    return [...swipedJobs, ...localSwipedJobs];
  }, [swipedJobs, localSwipedJobs]);

  const matches = getJobMatches();

  // Filter out already swiped jobs
  const availableJobs = useMemo(() => {
    const swipedIds = allSwipedJobs.map(s => s.jobId);
    return matches.filter(m => !swipedIds.includes(m.job.id));
  }, [matches, allSwipedJobs]);

  // Get liked jobs
  const likedJobs = useMemo(() => {
    const likedIds = allSwipedJobs.filter(s => s.liked).map(s => s.jobId);
    return matches.filter(m => likedIds.includes(m.job.id));
  }, [matches, allSwipedJobs]);

  const currentJob = availableJobs[currentIndex];

  const handleSwipe = async (liked: boolean) => {
    if (!currentJob || isAnimating) return;
    
    setIsAnimating(true);
    setDirection(liked ? 'right' : 'left');

    // Save to global state
    swipeJob(currentJob.job.id, liked);

    setTimeout(() => {
      setLocalSwipedJobs(prev => [...prev, { jobId: currentJob.job.id, liked, timestamp: new Date() }]);
      setCurrentIndex(prev => prev + 1);
      setDirection(null);
      setIsAnimating(false);
    }, 300);
  };

  const handleUndo = () => {
    if (localSwipedJobs.length === 0) return;
    undoSwipe();
    setLocalSwipedJobs(prev => prev.slice(0, -1));
    setCurrentIndex(prev => Math.max(0, prev - 1));
  };

  const handleApply = async (jobId: string) => {
    alert('Apply button clicked for job: ' + jobId);
    console.log('Applying to job:', jobId);
    try {
      const { error } = await applyToJob(jobId);
      if (error) {
        console.error('Application error:', error);
        alert('Failed to apply: ' + error.message);
      } else {
        console.log('Application successful');
        alert('Application submitted successfully!');
        setShowDetail(null);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      alert('An unexpected error occurred: ' + err);
    }
  };

  const getCompany = (job: Job) => {
    return companies.find(c => c.id === job.companyId) || { name: 'Unknown Company', logo: undefined };
  };

  const getMatchColor = (score: number) => {
    if (score >= 90) return 'text-green-400 bg-green-500/20 border-green-500/30';
    if (score >= 75) return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
    if (score >= 60) return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
    return 'text-muted-foreground bg-muted';
  };

  const getBadgeClass = (level: string) => {
    switch (level) {
      case 'bronze': return 'badge-bronze';
      case 'silver': return 'badge-silver';
      case 'gold': return 'badge-gold';
      case 'platinum': return 'badge-platinum';
      default: return 'bg-muted';
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeTab !== 'discover') return;
      if (e.key === 'ArrowLeft') handleSwipe(false);
      if (e.key === 'ArrowRight') handleSwipe(true);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentJob, isAnimating, activeTab]);

  const renderJobCard = (jobMatch: JobMatch, isPreview: boolean = false) => {
    const job = jobMatch.job;
    const company = getCompany(job);

    return (
      <div 
        className={`relative w-full max-w-md mx-auto ${isPreview ? '' : 'h-[600px]'}`}
        style={{ touchAction: 'none' }}
      >
        <Card 
          className={`absolute inset-0 overflow-hidden border-2 transition-all duration-300 ${
            direction === 'right' && !isPreview
              ? 'translate-x-full rotate-12 opacity-0' 
              : direction === 'left' && !isPreview
              ? '-translate-x-full -rotate-12 opacity-0'
              : ''
          } ${!isPreview ? 'shadow-2xl' : ''}`}
        >
          {/* Company Header Image */}
          <div className="h-32 bg-gradient-to-br from-primary/30 via-accent/20 to-background relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 rounded-2xl bg-card border-2 border-white/10 flex items-center justify-center shadow-xl">
                {company?.logo ? (
                  <img src={company.logo} alt={company.name} className="w-14 h-14 rounded-xl object-cover" />
                ) : (
                  <Building2 className="w-10 h-10 text-muted-foreground" />
                )}
              </div>
            </div>
            {/* Match Score Badge */}
            <div className="absolute top-4 right-4">
              <Badge className={`${getMatchColor(jobMatch.compatibilityScore)} border`}>
                <Star className="w-3 h-3 mr-1 fill-current" />
                {jobMatch.compatibilityScore}% Match
              </Badge>
            </div>
          </div>

          {/* Job Content */}
          <CardContent className="p-6 pt-12">
            <div className="text-center mb-4">
              <h3 className="text-xl font-bold mb-1">{job.title}</h3>
              <p className="text-muted-foreground">{company?.name}</p>
            </div>

            {/* Quick Info */}
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              <Badge variant="secondary" className="text-xs">
                <MapPin className="w-3 h-3 mr-1" />
                {job.location.remote ? 'Remote' : job.location.city}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                <Briefcase className="w-3 h-3 mr-1" />
                {job.type.replace('-', ' ')}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                <TrendingUp className="w-3 h-3 mr-1" />
                {job.experienceLevel}
              </Badge>
              {job.salary && (
                <Badge variant="secondary" className="text-xs">
                  <DollarSign className="w-3 h-3 mr-1" />
                  ${(job.salary.min / 1000).toFixed(0)}k
                </Badge>
              )}
            </div>

            {/* Match Breakdown */}
            <div className="grid grid-cols-5 gap-2 mb-4">
              <div className="text-center p-2 rounded-lg bg-muted">
                <p className="text-xs text-muted-foreground">Skills</p>
                <p className={`text-sm font-semibold ${jobMatch.skillsMatch >= 80 ? 'text-green-400' : ''}`}>
                  {jobMatch.skillsMatch}%
                </p>
              </div>
              <div className="text-center p-2 rounded-lg bg-muted">
                <p className="text-xs text-muted-foreground">Exp</p>
                <p className={`text-sm font-semibold ${jobMatch.experienceMatch >= 80 ? 'text-green-400' : ''}`}>
                  {jobMatch.experienceMatch}%
                </p>
              </div>
              <div className="text-center p-2 rounded-lg bg-muted">
                <p className="text-xs text-muted-foreground">Loc</p>
                <p className={`text-sm font-semibold ${jobMatch.locationMatch >= 80 ? 'text-green-400' : ''}`}>
                  {jobMatch.locationMatch}%
                </p>
              </div>
              <div className="text-center p-2 rounded-lg bg-muted">
                <p className="text-xs text-muted-foreground">Pay</p>
                <p className={`text-sm font-semibold ${jobMatch.salaryMatch >= 80 ? 'text-green-400' : ''}`}>
                  {jobMatch.salaryMatch}%
                </p>
              </div>
              <div className="text-center p-2 rounded-lg bg-muted">
                <p className="text-xs text-muted-foreground">Ind</p>
                <p className={`text-sm font-semibold ${jobMatch.industryMatch >= 80 ? 'text-green-400' : ''}`}>
                  {jobMatch.industryMatch}%
                </p>
              </div>
            </div>

            {/* Skills */}
            <div className="flex flex-wrap justify-center gap-1 mb-4">
              {job.skills.slice(0, 5).map((skill, i) => {
                const hasSkill = profile?.skills?.some(s => s.name.toLowerCase() === skill.toLowerCase()) || false;
                return (
                  <Badge
                    key={i}
                    variant={hasSkill ? 'default' : 'secondary'}
                    className={`text-xs ${hasSkill ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' : ''}`}
                  >
                    {hasSkill && <CheckCircle className="w-2 h-2 mr-1" />}
                    {skill}
                  </Badge>
                );
              })}
              {job.skills.length > 5 && (
                <Badge variant="outline" className="text-xs">+{job.skills.length - 5}</Badge>
              )}
            </div>

            {/* Description Preview */}
            <p className="text-sm text-muted-foreground text-center line-clamp-3">
              {job.description}
            </p>
          </CardContent>

          {/* Action Buttons (only for main card) */}
          {!isPreview && (
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background to-transparent">
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => handleSwipe(false)}
                  className="w-14 h-14 rounded-full bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-200 flex items-center justify-center shadow-lg"
                >
                  <X className="w-7 h-7" />
                </button>
                <button
                  onClick={() => setShowDetail(job)}
                  className="w-12 h-12 rounded-full bg-muted text-muted-foreground hover:bg-primary/20 hover:text-primary transition-all duration-200 flex items-center justify-center"
                >
                  <Info className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleSwipe(true)}
                  className="w-14 h-14 rounded-full bg-green-500/20 text-green-500 hover:bg-green-500 hover:text-white transition-all duration-200 flex items-center justify-center shadow-lg"
                >
                  <Heart className="w-7 h-7" />
                </button>
              </div>
              <p className="text-center text-xs text-muted-foreground mt-3">
                Press ← to skip, → to like
              </p>
            </div>
          )}
        </Card>

        {/* Next Card Preview */}
        {!isPreview && availableJobs[currentIndex + 1] && (
          <div 
            className="absolute inset-0 scale-95 opacity-50 -z-10"
            style={{ transform: 'translateY(10px) scale(0.95)' }}
          >
            <Card className="h-full border-2 border-border/50" />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="animate-slide-up space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Job Matcher</h2>
            <p className="text-muted-foreground">
              {activeTab === 'discover' 
                ? `${availableJobs.length} jobs waiting for you`
                : `${likedJobs.length} jobs you liked`
              }
            </p>
          </div>
          <div className="flex gap-2">
            {activeTab === 'discover' && (
              <Button variant="outline" size="sm" onClick={() => setShowFilters(true)}>
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Filters
              </Button>
            )}
            <TabsList>
              <TabsTrigger value="discover">Discover</TabsTrigger>
              <TabsTrigger value="matches">
                Liked
                {likedJobs.length > 0 && (
                  <span className="ml-2 px-1.5 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                    {likedJobs.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        <TabsContent value="discover" className="mt-0">
          {currentJob ? (
            <div className="relative">
              {/* Undo Button */}
              {localSwipedJobs.length > 0 && (
                <button
                  onClick={handleUndo}
                  className="absolute top-4 left-4 z-20 w-10 h-10 rounded-full bg-muted hover:bg-primary/20 transition-colors flex items-center justify-center"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
              )}

              {/* Job Card */}
              <div className="py-8">
                {renderJobCard(currentJob)}
              </div>
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
                <Bookmark className="w-12 h-12 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No more jobs</h3>
              <p className="text-muted-foreground mb-6">
                You've seen all available jobs. Check your matches or adjust your filters.
              </p>
              <div className="flex justify-center gap-3">
                <Button variant="outline" onClick={() => setActiveTab('matches')}>
                  View Matches
                </Button>
                <Button onClick={() => { setLocalSwipedJobs([]); setCurrentIndex(0); }}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Start Over
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="matches" className="mt-0">
          {likedJobs.length > 0 ? (
            <div className="space-y-4">
              {likedJobs.map((match) => {
                const job = match.job;
                const company = getCompany(job);
                const hasApplied = applications.some(app => app.jobId === job.id);

                return (
                  <Card key={job.id} className="card-hover">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                          {company?.logo ? (
                            <img src={company.logo} alt={company.name} className="w-10 h-10 rounded-lg object-cover" />
                          ) : (
                            <Building2 className="w-7 h-7 text-muted-foreground" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold truncate">{job.title}</h4>
                            <Badge className={`${getMatchColor(match.compatibilityScore)} border`}>
                              <Star className="w-3 h-3 mr-1 fill-current" />
                              {match.compatibilityScore}% Match
                            </Badge>
                            {hasApplied && (
                              <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Applied
                              </Badge>
                            )}
                          </div>

                          <p className="text-sm text-muted-foreground mb-2">
                            {company?.name} • {job.location.remote ? 'Remote' : job.location.city}
                          </p>

                          <div className="flex flex-wrap gap-2 mb-3">
                            {job.skills.slice(0, 4).map((skill, i) => (
                              <span key={i} className="text-xs px-2 py-1 rounded-full bg-muted">
                                {skill}
                              </span>
                            ))}
                          </div>

                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>Liked {allSwipedJobs.find((s: any) => s.jobId === job.id)?.timestamp?.toLocaleDateString()}</span>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          {!hasApplied ? (
                            <Button size="sm" onClick={() => handleApply(job.id)}>
                              <Send className="w-4 h-4 mr-2" />
                              Apply
                            </Button>
                          ) : (
                            <Button size="sm" variant="secondary" disabled>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Applied
                            </Button>
                          )}
                          <Button variant="outline" size="sm" onClick={() => setShowDetail(job)}>
                            <Info className="w-4 h-4 mr-2" />
                            Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
                <Heart className="w-12 h-12 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No matches yet</h3>
              <p className="text-muted-foreground mb-6">
                Start swiping to find jobs you like. Right swipe to add them here.
              </p>
              <Button onClick={() => setActiveTab('discover')}>
                Start Swiping
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Job Detail Dialog */}
      <Dialog open={!!showDetail} onOpenChange={() => setShowDetail(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {showDetail && (
            <>
              <DialogHeader>
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center">
                    <Building2 className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div>
                    <DialogTitle className="text-2xl">{showDetail.title}</DialogTitle>
                    <DialogDescription className="text-lg">
                      {getCompany(showDetail).name} • {showDetail.location.city || 'Remote'}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">
                    <Briefcase className="w-4 h-4 mr-2" />
                    {showDetail.type.replace('-', ' ')}
                  </Badge>
                  <Badge variant="secondary">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    {showDetail.experienceLevel}
                  </Badge>
                  {showDetail.location.remote && (
                    <Badge variant="secondary">
                      <MapPin className="w-4 h-4 mr-2" />
                      Remote
                    </Badge>
                  )}
                  {showDetail.salary && (
                    <Badge variant="secondary">
                      <DollarSign className="w-4 h-4 mr-2" />
                      ${(showDetail.salary.min / 1000).toFixed(0)}k - {(showDetail.salary.max / 1000).toFixed(0)}k
                    </Badge>
                  )}
                </div>

                <div>
                  <h4 className="font-semibold mb-2">About the Role</h4>
                  <p className="text-muted-foreground">{showDetail.description}</p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Requirements</h4>
                  <ul className="space-y-2">
                    {showDetail.requirements.map((req, i) => (
                      <li key={i} className="flex items-start gap-2 text-muted-foreground">
                        <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Responsibilities</h4>
                  <ul className="space-y-2">
                    {showDetail.responsibilities.map((resp, i) => (
                      <li key={i} className="flex items-start gap-2 text-muted-foreground">
                        <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        {resp}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Required Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {showDetail.skills.map((skill, i) => (
                      <Badge key={i} variant="secondary">
                        <Code className="w-3 h-3 mr-1" />
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  {!applications.some(app => app.jobId === showDetail.id) ? (
                    <Button className="flex-1" onClick={() => handleApply(showDetail.id)}>
                      <Send className="w-4 h-4 mr-2" />
                      Apply Now
                    </Button>
                  ) : (
                    <Button className="flex-1" variant="secondary" disabled>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Applied
                    </Button>
                  )}
                  <Button variant="outline">
                    <Bookmark className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                <