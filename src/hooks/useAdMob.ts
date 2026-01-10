import { useCallback, useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';

// AdMob types
interface AdMobRewardItem {
  type: string;
  amount: number;
}

interface RewardedAdPluginEvents {
  loaded: () => void;
  failedToLoad: (error: { code: number; message: string }) => void;
  showed: () => void;
  failedToShow: (error: { code: number; message: string }) => void;
  dismissed: () => void;
  rewarded: (reward: AdMobRewardItem) => void;
}

// Test Ad Unit IDs (replace with your real ones in production)
const AD_UNIT_IDS = {
  android: {
    rewarded: 'ca-app-pub-3940256099942544/5224354917', // Test ID
  },
  ios: {
    rewarded: 'ca-app-pub-3940256099942544/1712485313', // Test ID
  },
};

export const useAdMob = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdReady, setIsAdReady] = useState(false);
  const [lastReward, setLastReward] = useState<AdMobRewardItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isNative = Capacitor.isNativePlatform();

  // Initialize AdMob
  const initialize = useCallback(async () => {
    if (!isNative) {
      console.log('AdMob: Not running on native platform');
      return false;
    }

    try {
      const { AdMob } = await import('@capacitor-community/admob');
      
      await AdMob.initialize({
        initializeForTesting: true, // Set to false in production
      });
      
      setIsInitialized(true);
      console.log('AdMob initialized successfully');
      return true;
    } catch (err) {
      console.error('Failed to initialize AdMob:', err);
      setError('Failed to initialize ads');
      return false;
    }
  }, [isNative]);

  // Get the correct ad unit ID based on platform
  const getRewardedAdUnitId = useCallback(() => {
    const platform = Capacitor.getPlatform();
    if (platform === 'android') {
      return AD_UNIT_IDS.android.rewarded;
    } else if (platform === 'ios') {
      return AD_UNIT_IDS.ios.rewarded;
    }
    return '';
  }, []);

  // Prepare a rewarded ad
  const prepareRewardedAd = useCallback(async () => {
    if (!isNative || !isInitialized) {
      console.log('AdMob: Cannot prepare ad - not initialized or not native');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { AdMob, RewardAdPluginEvents } = await import('@capacitor-community/admob');
      
      // Set up event listeners
      AdMob.addListener(RewardAdPluginEvents.Loaded, () => {
        console.log('Rewarded ad loaded');
        setIsAdReady(true);
        setIsLoading(false);
      });

      AdMob.addListener(RewardAdPluginEvents.FailedToLoad, (info: { code: number; message: string }) => {
        console.error('Rewarded ad failed to load:', info.message);
        setError('Failed to load ad');
        setIsLoading(false);
        setIsAdReady(false);
      });

      AdMob.addListener(RewardAdPluginEvents.Showed, () => {
        console.log('Rewarded ad showed');
      });

      AdMob.addListener(RewardAdPluginEvents.Dismissed, () => {
        console.log('Rewarded ad dismissed');
        setIsAdReady(false);
        // Prepare next ad
        prepareRewardedAd();
      });

      AdMob.addListener(RewardAdPluginEvents.Rewarded, (reward: AdMobRewardItem) => {
        console.log('User earned reward:', reward);
        setLastReward(reward);
      });

      // Prepare the rewarded ad
      await AdMob.prepareRewardVideoAd({
        adId: getRewardedAdUnitId(),
        isTesting: true, // Set to false in production
      });

      return true;
    } catch (err) {
      console.error('Error preparing rewarded ad:', err);
      setError('Error preparing ad');
      setIsLoading(false);
      return false;
    }
  }, [isNative, isInitialized, getRewardedAdUnitId]);

  // Show the rewarded ad
  const showRewardedAd = useCallback(async (): Promise<AdMobRewardItem | null> => {
    if (!isNative) {
      // Simulate reward for web testing
      console.log('AdMob: Simulating reward for web');
      const simulatedReward = { type: 'coins', amount: 10 };
      setLastReward(simulatedReward);
      return simulatedReward;
    }

    if (!isAdReady) {
      console.log('AdMob: Ad not ready');
      setError('Ad not ready yet');
      return null;
    }

    try {
      const { AdMob } = await import('@capacitor-community/admob');
      
      await AdMob.showRewardVideoAd();
      
      // Return the last reward (will be set by the event listener)
      return lastReward;
    } catch (err) {
      console.error('Error showing rewarded ad:', err);
      setError('Error showing ad');
      return null;
    }
  }, [isNative, isAdReady, lastReward]);

  // Initialize on mount
  useEffect(() => {
    if (isNative && !isInitialized) {
      initialize().then((success) => {
        if (success) {
          prepareRewardedAd();
        }
      });
    }
  }, [isNative, isInitialized, initialize, prepareRewardedAd]);

  return {
    isNative,
    isInitialized,
    isLoading,
    isAdReady,
    lastReward,
    error,
    initialize,
    prepareRewardedAd,
    showRewardedAd,
  };
};
