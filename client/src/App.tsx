import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthGuard } from "@/components/AuthGuard";
import NotFound from "@/pages/not-found";
import { Homepage } from "@/pages/Homepage";
import { OnboardingIntro } from "@/pages/OnboardingIntro";
import { OnboardingName } from "@/pages/OnboardingName";
import { GoalSelection } from "@/pages/GoalSelection";
import { YoullFitRightIn } from "@/pages/YoullFitRightIn";
import { VibeCheck } from "@/pages/VibeCheck";
import { SubjectPicker } from "@/pages/SubjectPicker";
import { OnboardingComplete } from "@/pages/OnboardingComplete";
import { GameHome } from "@/pages/GameHome";
import { SketchIntro } from "@/pages/SketchIntro";
import { SketchCanvas } from "@/pages/SketchCanvas";
import { SketchRecap } from "@/pages/SketchRecap";
import { QuizIntro } from "@/pages/QuizIntro";
import { QuizPlay } from "@/pages/QuizPlay";
import { QuizResults } from "@/pages/QuizResults";
import { Hub } from "@/pages/Hub";
import { Friends } from "@/pages/Friends";
import { Profile } from "@/pages/Profile";
import { Landing } from "@/pages/Landing";
import { MeditationIntro } from "@/pages/MeditationIntro";
import { MeditationSession } from "@/pages/MeditationSession";
import { MeditationComplete } from "@/pages/MeditationComplete";
import { RebusIntro } from "@/pages/RebusIntro";
import { RebusPlay } from "@/pages/RebusPlay";
import { RebusComplete } from "@/pages/RebusComplete";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Homepage} />
      <Route path="/onboarding/intro" component={OnboardingIntro} />
      <Route path="/onboarding/name" component={OnboardingName} />
      <Route path="/onboarding/goal" component={GoalSelection} />
      <Route path="/onboarding/fit" component={YoullFitRightIn} />
      <Route path="/onboarding/vibe" component={VibeCheck} />
      <Route path="/onboarding/subjects" component={SubjectPicker} />
      <Route path="/onboarding/complete" component={OnboardingComplete} />
      <Route path="/start" component={Landing} />
      <Route path="/home" component={GameHome} />
      <Route path="/hub" component={Hub} />
      <Route path="/friends" component={Friends} />
      <Route path="/profile" component={Profile} />
      <Route path="/meditation/intro" component={MeditationIntro} />
      <Route path="/meditation/session" component={MeditationSession} />
      <Route path="/meditation/complete" component={MeditationComplete} />
      <Route path="/game/sketch/intro" component={SketchIntro} />
      <Route path="/game/sketch" component={SketchCanvas} />
      <Route path="/game/sketch/recap" component={SketchRecap} />
      <Route path="/quiz/:quizId" component={QuizIntro} />
      <Route path="/quiz/:quizId/play" component={QuizPlay} />
      <Route path="/quiz/:quizId/results" component={QuizResults} />
      <Route path="/rebus" component={RebusIntro} />
      <Route path="/rebus/play" component={RebusPlay} />
      <Route path="/rebus/complete" component={RebusComplete} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AuthGuard>
          <Router />
        </AuthGuard>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
