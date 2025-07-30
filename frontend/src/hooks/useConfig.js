import { useState, useEffect } from "react";
import configService from "../services/configService";

export const useConfig = () => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeConfig = async () => {
      try {
        setLoading(true);
        const status = await configService.initialize();
        setConfig(status);
        setError(null);
      } catch (err) {
        console.error("Config initialization error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    initializeConfig();
  }, []);

  const refreshConfig = async () => {
    try {
      setLoading(true);
      const status = await configService.initialize();
      setConfig(status);
      setError(null);
    } catch (err) {
      console.error("Config refresh error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    config,
    loading,
    error,
    refreshConfig,
    // Convenience methods
    isMobile: config?.isMobile || false,
    acceptMobile: config?.acceptMobile || false,
    shouldBlock: config?.shouldBlock || false,
  };
};
