'use client';

// Core Web Vitals monitoring
export const reportWebVitals = (metric) => {
  if (typeof window !== 'undefined') {
    // Log metrics in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Web Vital:', metric);
    }

    // Send to analytics in production
    if (process.env.NODE_ENV === 'production') {
      // Replace with your analytics service
      if (window.gtag) {
        window.gtag('event', metric.name, {
          event_category: 'Web Vitals',
          event_label: metric.id,
          value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
          non_interaction: true,
        });
      }
    }
  }
};

// Performance observer for custom metrics
export class PerformanceMonitor {
  constructor() {
    this.metrics = {};
    this.observers = [];
    
    if (typeof window !== 'undefined') {
      this.initializeObservers();
    }
  }

  initializeObservers() {
    // Observe paint metrics
    if ('PerformanceObserver' in window) {
      try {
        const paintObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.metrics[entry.name] = entry.startTime;
          }
        });
        paintObserver.observe({ entryTypes: ['paint'] });
        this.observers.push(paintObserver);
      } catch (e) {
        console.warn('Paint observer not supported');
      }

      // Observe navigation timing
      try {
        const navigationObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.metrics.navigationTiming = {
              domContentLoaded: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
              loadComplete: entry.loadEventEnd - entry.loadEventStart,
              domInteractive: entry.domInteractive - entry.fetchStart,
              totalTime: entry.loadEventEnd - entry.fetchStart,
            };
          }
        });
        navigationObserver.observe({ entryTypes: ['navigation'] });
        this.observers.push(navigationObserver);
      } catch (e) {
        console.warn('Navigation observer not supported');
      }

      // Observe resource timing
      try {
        const resourceObserver = new PerformanceObserver((list) => {
          const resources = list.getEntries();
          this.analyzeResourceTiming(resources);
        });
        resourceObserver.observe({ entryTypes: ['resource'] });
        this.observers.push(resourceObserver);
      } catch (e) {
        console.warn('Resource observer not supported');
      }
    }
  }

  analyzeResourceTiming(resources) {
    const resourceMetrics = {
      totalResources: resources.length,
      slowResources: [],
      largeResources: [],
      totalTransferSize: 0,
      totalEncodedSize: 0,
    };

    resources.forEach((resource) => {
      const duration = resource.responseEnd - resource.requestStart;
      const transferSize = resource.transferSize || 0;
      const encodedSize = resource.encodedBodySize || 0;

      resourceMetrics.totalTransferSize += transferSize;
      resourceMetrics.totalEncodedSize += encodedSize;

      // Flag slow resources (> 1 second)
      if (duration > 1000) {
        resourceMetrics.slowResources.push({
          name: resource.name,
          duration,
          size: transferSize,
        });
      }

      // Flag large resources (> 1MB)
      if (transferSize > 1024 * 1024) {
        resourceMetrics.largeResources.push({
          name: resource.name,
          size: transferSize,
          duration,
        });
      }
    });

    this.metrics.resources = resourceMetrics;
  }

  // Mark custom performance points
  markEvent(name) {
    if (typeof window !== 'undefined' && 'performance' in window) {
      performance.mark(name);
    }
  }

  // Measure between two marks
  measureEvent(name, startMark, endMark) {
    if (typeof window !== 'undefined' && 'performance' in window) {
      try {
        performance.measure(name, startMark, endMark);
        const measure = performance.getEntriesByName(name, 'measure')[0];
        this.metrics[name] = measure.duration;
        return measure.duration;
      } catch (e) {
        console.warn(`Could not measure ${name}:`, e);
      }
    }
  }

  // Get current metrics
  getMetrics() {
    return { ...this.metrics };
  }

  // Log performance summary
  logSummary() {
    console.group('Performance Summary');
    console.table(this.metrics);
    
    if (this.metrics.resources) {
      console.group('Resource Analysis');
      console.log('Total Resources:', this.metrics.resources.totalResources);
      console.log('Total Transfer Size:', `${(this.metrics.resources.totalTransferSize / 1024 / 1024).toFixed(2)} MB`);
      
      if (this.metrics.resources.slowResources.length > 0) {
        console.warn('Slow Resources (>1s):', this.metrics.resources.slowResources);
      }
      
      if (this.metrics.resources.largeResources.length > 0) {
        console.warn('Large Resources (>1MB):', this.metrics.resources.largeResources);
      }
      console.groupEnd();
    }
    
    console.groupEnd();
  }

  // Cleanup observers
  disconnect() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Utility function to measure component render time
export const withPerformanceTracking = (Component, componentName) => {
  return function PerformanceTrackedComponent(props) {
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      const renderStart = `${componentName}-render-start`;
      const renderEnd = `${componentName}-render-end`;
      
      performanceMonitor.markEvent(renderStart);
      
      // Mark end after component mounts
      React.useEffect(() => {
        performanceMonitor.markEvent(renderEnd);
        const duration = performanceMonitor.measureEvent(
          `${componentName}-render`,
          renderStart,
          renderEnd
        );
        
        if (duration > 16) { // Warn if render takes longer than one frame
          console.warn(`${componentName} render time: ${duration.toFixed(2)}ms`);
        }
      }, []);
    }
    
    return React.createElement(Component, props);
  };
};