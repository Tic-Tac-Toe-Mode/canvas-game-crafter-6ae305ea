import { useCallback, useState, useEffect, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { toast } from 'sonner';

// AdMob types
interface AdMobRewardItem {
  type: string;
  amount: number;
}

// AdMob Configuration
// App ID: ca-app-pub-6933845365930069~7195590932
// Ad Unit IDs for Interstitial Ads
const AD_UNIT_IDS = {
  android: {
    interstitial: 'ca-app-pub-6933845365930069/1017017786',
  },
  ios: {
    interstitial: 'ca-app-pub-6933845365930069/1017017786',
  },
};

// Reward amount for watching ads
const AD_REWARD_AMOUNT = 10;

export const useAdMob = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdReady, setIsAdReady] = useState(false);
  const [lastReward, setLastReward] = useState<AdMobRewardItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Promise resolver for ad completion
  const adCompletionResolver = useRef<((value: AdMobRewardItem | null) => void) | null>(null);
  const adWasShown = useRef(false);

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
        initializeForTesting: false, // Using real ads with your App ID
      });
      
      setIsInitialized(true);
      console.log('AdMob initialized successfully with App ID: ca-app-pub-6933845365930069~7195590932');
      return true;
    } catch (err) {
      console.error('Failed to initialize AdMob:', err);
      setError('Failed to initialize ads');
      return false;
    }
  }, [isNative]);

  // Get the correct ad unit ID based on platform
  const getInterstitialAdUnitId = useCallback(() => {
    const platform = Capacitor.getPlatform();
    if (platform === 'android') {
      return AD_UNIT_IDS.android.interstitial;
    } else if (platform === 'ios') {
      return AD_UNIT_IDS.ios.interstitial;
    }
    return '';
  }, []);

  // Prepare an interstitial ad
  const prepareInterstitialAd = useCallback(async () => {
    if (!isNative || !isInitialized) {
      console.log('AdMob: Cannot prepare ad - not initialized or not native');
      return false;
    }

    if (isLoading || isAdReady) {
      console.log('AdMob: Ad already loading or ready');
      return true;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { AdMob, InterstitialAdPluginEvents } = await import('@capacitor-community/admob');
      
      // Set up event listeners
      AdMob.addListener(InterstitialAdPluginEvents.Loaded, () => {
        console.log('Interstitial ad loaded successfully');
        setIsAdReady(true);
        setIsLoading(false);
      });

      AdMob.addListener(InterstitialAdPluginEvents.FailedToLoad, (info: { code: number; message: string }) => {
        console.error('Interstitial ad failed to load:', info.message);
        setError(`Failed to load ad: ${info.message}`);
        setIsLoading(false);
        setIsAdReady(false);
        
        // Resolve promise with null (no reward)
        if (adCompletionResolver.current) {
          adCompletionResolver.current(null);
          adCompletionResolver.current = null;
        }
      });

      AdMob.addListener(InterstitialAdPluginEvents.Showed, () => {
        console.log('Interstitial ad is now showing');
        adWasShown.current = true;
      });

      AdMob.addListener(InterstitialAdPluginEvents.Dismissed, () => {
        console.log('Interstitial ad dismissed - user completed watching');
        setIsAdReady(false);
        
        // Only give reward if ad was actually shown
        if (adWasShown.current) {
          const reward: AdMobRewardItem = { type: 'coins', amount: AD_REWARD_AMOUNT };
          setLastReward(reward);
          
          // Resolve the promise with the reward
          if (adCompletionResolver.current) {
            adCompletionResolver.current(reward);
            adCompletionResolver.current = null;
          }
          
          toast.success(`✅ Ad completed! +${AD_REWARD_AMOUNT} coins earned!`, { duration: 3000 });
        }
        
        adWasShown.current = false;
        
        // Prepare the next ad
        setTimeout(() => {
          prepareInterstitialAd();
        }, 1000);
      });

      AdMob.addListener(InterstitialAdPluginEvents.FailedToShow, (info: { code: number; message: string }) => {
        console.error('Interstitial ad failed to show:', info.message);
        setError(`Failed to show ad: ${info.message}`);
        setIsAdReady(false);
        adWasShown.current = false;
        
        // Resolve promise with null (no reward)
        if (adCompletionResolver.current) {
          adCompletionResolver.current(null);
          adCompletionResolver.current = null;
        }
      });

      // Prepare the interstitial ad
      await AdMob.prepareInterstitial({
        adId: getInterstitialAdUnitId(),
        isTesting: false, // Real ads
      });

      console.log('Interstitial ad preparation started');
      return true;
    } catch (err) {
      console.error('Error preparing interstitial ad:', err);
      setError('Error preparing ad');
      setIsLoading(false);
      return false;
    }
  }, [isNative, isInitialized, isLoading, isAdReady, getInterstitialAdUnitId]);

  // Show the interstitial ad and wait for completion
  const showInterstitialAd = useCallback(async (): Promise<AdMobRewardItem | null> => {
    // For web testing - simulate a short delay then give reward
    if (!isNative) {
      console.log('AdMob: Web mode - simulating ad watch');
      toast.info('📺 Simulating ad (web mode)...', { duration: 2000 });
      
      // Simulate watching an ad
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const simulatedReward: AdMobRewardItem = { type: 'coins', amount: AD_REWARD_AMOUNT };
      setLastReward(simulatedReward);
      return simulatedReward;
    }

    // Native platform
    if (!isAdReady) {
      console.log('AdMob: Ad not ready');
      setError('Ad not ready yet. Please wait...');
      toast.warning('⏳ Ad is loading, please wait...', { duration: 2000 });
      
      // Try to prepare an ad
      prepareInterstitialAd();
      return null;
    }

    try {
      const { AdMob } = await import('@capacitor-community/admob');
      
      // Create a promise that will resolve when the ad is dismissed
      const rewardPromise = new Promise<AdMobRewardItem | null>((resolve) => {
        adCompletionResolver.current = resolve;
        
        // Timeout after 2 minutes (in case something goes wrong)
        setTimeout(() => {
          if (adCompletionResolver.current) {
            console.log('AdMob: Ad completion timeout');
            adCompletionResolver.current(null);
            adCompletionResolver.current = null;
          }
        }, 120000);
      });
      
      // Show the ad
      await AdMob.showInterstitial();
      
      // Wait for the ad to be dismissed and return the reward
      const reward = await rewardPromise;
      return reward;
    } catch (err) {
      console.error('Error showing interstitial ad:', err);
      setError('Error showing ad');
      adCompletionResolver.current = null;
      return null;
    }
  }, [isNative, isAdReady, prepareInterstitialAd]);

  // Initialize on mount
  useEffect(() => {
    if (isNative && !isInitialized) {
      initialize().then((success) => {
        if (success) {
          prepareInterstitialAd();
        }
      });
    }
  }, [isNative, isInitialized, initialize, prepareInterstitialAd]);

  return {
    isNative,
    isInitialized,
    isLoading,
    isAdReady,
    lastReward,
    error,
    initialize,
    prepareAd: prepareInterstitialAd,
    showAd: showInterstitialAd,
    // Aliases for backward compatibility
    prepareRewardedAd: prepareInterstitialAd,
    showRewardedAd: showInterstitialAd,
    // Constants
    adRewardAmount: AD_REWARD_AMOUNT,
  };
};
