import { useState, useCallback } from "react";
import { VibeSetup } from "./screens/VibeSetup";
import { GenerationViewer } from "./screens/GenerationViewer";
import { PlayerScreen } from "./screens/PlayerScreen";
import { usePreferences } from "./hooks/usePreferences";
import { startGeneration } from "./lib/api";

type Screen = "setup" | "generating" | "player";

function App() {
  const { preferences, setPreferences, toggleInterest, hasCompletedSetup } =
    usePreferences();
  const [screen, setScreen] = useState<Screen>(
    hasCompletedSetup ? "player" : "setup"
  );
  const [episodeId, setEpisodeId] = useState<string | undefined>();
  const [genError, setGenError] = useState<string | null>(null);

  const handleStart = useCallback(async (phUrl?: string) => {
    setGenError(null);
    try {
      const result = await startGeneration(preferences, phUrl);
      setEpisodeId(result.episode_id);
      setScreen("generating");
    } catch (err) {
      setGenError(
        err instanceof Error ? err.message : "Failed to start generation"
      );
    }
  }, [preferences]);

  const handleGenerationComplete = useCallback((id: string) => {
    setEpisodeId(id);
    setScreen("player");
  }, []);

  return (
    <>
      {screen === "setup" && (
        <VibeSetup
          preferences={preferences}
          onToggleInterest={toggleInterest}
          onSetPreferences={setPreferences}
          onStart={handleStart}
        />
      )}

      {screen === "generating" && (
        <GenerationViewer onComplete={handleGenerationComplete} />
      )}

      {screen === "player" && (
        <PlayerScreen
          episodeId={episodeId}
          onBack={() => setScreen("setup")}
        />
      )}

      {/* Generation error toast */}
      {genError && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-error/90 text-white px-4 py-2 rounded-lg text-sm max-w-sm text-center">
          {genError}
          <button
            onClick={() => setGenError(null)}
            className="ml-2 underline"
          >
            Dismiss
          </button>
        </div>
      )}
    </>
  );
}

export default App;
