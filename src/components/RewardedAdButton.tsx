import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Gift, Play, Loader2, Coins, AlertCircle } from 'lucide-react';
import { useAdMob } from '@/hooks/useAdMob';
import { toast } from 'sonner';

interface RewardedAdButtonProps {
  onRewardEarned?: (reward: { type: string; amount: number }) => void;
  rewardType?: 'coins' | 'hints' | 'continue';
  rewardAmount?: number;
  buttonText?: string;
  className?: string;
}

export const RewardedAdButton: React.FC<RewardedAdButtonProps> = ({
  onRewardEarned,
  rewardType = 'coins',
  rewardAmount = 10,
  buttonText = 'Watch Ad',
  className = '',
}) => {
  const { isNative, isAdReady, isLoading, error, showRewardedAd, prepareRewardedAd } = useAdMob();
  const [showDialog, setShowDialog] = useState(false);
  const [isWatching, setIsWatching] = useState(false);

  const getRewardIcon = () => {
    switch (rewardType) {
      case 'coins':
        return <Coins className="h-5 w-5 text-yellow-500" />;
      case 'hints':
        return <Gift className="h-5 w-5 text-purple-500" />;
      case 'continue':
        return <Play className="h-5 w-5 text-green-500" />;
      default:
        return <Gift className="h-5 w-5" />;
    }
  };

  const getRewardDescription = () => {
    switch (rewardType) {
      case 'coins':
        return `Watch a short video to earn ${rewardAmount} coins!`;
      case 'hints':
        return `Watch a short video to get ${rewardAmount} hints!`;
      case 'continue':
        return 'Watch a short video to continue playing!';
      default:
        return 'Watch a short video to earn rewards!';
    }
  };

  const handleWatchAd = async () => {
    setIsWatching(true);
    
    try {
      const reward = await showRewardedAd();
      
      if (reward || !isNative) {
        // Reward earned (or simulated for web)
        const earnedReward = reward || { type: rewardType, amount: rewardAmount };
        
        toast.success(`🎉 You earned ${rewardAmount} ${rewardType}!`, {
          duration: 3000,
        });
        
        onRewardEarned?.(earnedReward);
        setShowDialog(false);
      }
    } catch (err) {
      toast.error('Failed to show ad. Please try again.');
    } finally {
      setIsWatching(false);
    }
  };

  const handleOpenDialog = () => {
    if (!isAdReady && isNative) {
      // Try to prepare an ad
      prepareRewardedAd();
    }
    setShowDialog(true);
  };

  return (
    <>
      <Button
        onClick={handleOpenDialog}
        variant="outline"
        className={`gap-2 ${className}`}
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <Play className="h-4 w-4" />
            {buttonText}
          </>
        )}
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {getRewardIcon()}
              Earn Rewards
            </DialogTitle>
            <DialogDescription>
              {getRewardDescription()}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                {getRewardIcon()}
                <span className="text-2xl font-bold">{rewardAmount}</span>
                <span className="text-lg capitalize">{rewardType}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {isNative ? 'Video ad duration: ~15-30 seconds' : 'Web preview: Instant reward'}
              </p>
            </div>

            {error && (
              <div className="mt-3 flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            {!isNative && (
              <div className="mt-3 text-xs text-muted-foreground text-center">
                Note: Ads work on mobile devices. Testing mode simulates rewards.
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleWatchAd} 
              disabled={isWatching || (isNative && !isAdReady)}
              className="gap-2"
            >
              {isWatching ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Watch Ad
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RewardedAdButton;
