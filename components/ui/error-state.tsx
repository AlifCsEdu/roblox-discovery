import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  showRetry?: boolean;
  icon?: 'error' | 'warning' | 'info';
}

export function ErrorState({ 
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  onRetry,
  showRetry = true,
  icon = 'error'
}: ErrorStateProps) {
  const iconConfig = {
    error: {
      color: 'text-red-500',
      bgColor: 'bg-red-500/20',
      path: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
    },
    warning: {
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/20',
      path: 'M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
    },
    info: {
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/20',
      path: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
    }
  };

  const currentIcon = iconConfig[icon];

  return (
    <div className="flex items-center justify-center p-8">
      <Card className="max-w-md w-full border-2 shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full ${currentIcon.bgColor} flex items-center justify-center`}>
              <svg className={`w-5 h-5 ${currentIcon.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={currentIcon.path} />
              </svg>
            </div>
            <CardTitle className={currentIcon.color}>{title}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">{message}</p>
          {showRetry && onRetry && (
            <Button onClick={onRetry} variant="outline" className="w-full">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Try Again
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
