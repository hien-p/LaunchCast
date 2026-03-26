import { useCallback } from "react";
import { Routes, Route, useNavigate, useParams } from "react-router-dom";
import { VibeSetup } from "./screens/VibeSetup";
import { GenerationViewer } from "./screens/GenerationViewer";
import { PlayerScreen } from "./screens/PlayerScreen";
import { HomeScreen } from "./screens/HomeScreen";
import { usePreferences } from "./hooks/usePreferences";
import { startGeneration } from "./lib/api";

function SetupPage() {
  const { preferences, setPreferences, toggleInterest } = usePreferences();
  const navigate = useNavigate();

  const handleStart = useCallback(
    async (phUrl?: string) => {
      try {
        const result = await startGeneration(preferences, phUrl);
        navigate(`/generating/${result.episode_id}`);
      } catch (err) {
        alert(err instanceof Error ? err.message : "Failed to start generation");
      }
    },
    [preferences, navigate]
  );

  return (
    <VibeSetup
      preferences={preferences}
      onToggleInterest={toggleInterest}
      onSetPreferences={setPreferences}
      onStart={handleStart}
    />
  );
}

function GeneratingPage() {
  const navigate = useNavigate();
  const { episodeId } = useParams();

  const handleComplete = useCallback(
    (id: string) => {
      navigate(`/episodes/${id}`);
    },
    [navigate]
  );

  return <GenerationViewer onComplete={handleComplete} />;
}

function EpisodePage() {
  const { episodeId } = useParams();
  const navigate = useNavigate();

  return (
    <PlayerScreen
      episodeId={episodeId}
      onBack={() => navigate("/")}
    />
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeScreen />} />
      <Route path="/setup" element={<SetupPage />} />
      <Route path="/generating/:episodeId" element={<GeneratingPage />} />
      <Route path="/episodes/:episodeId" element={<EpisodePage />} />
    </Routes>
  );
}

export default App;
