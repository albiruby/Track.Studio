export type PaginationStrategy = 'page' | 'cursor' | 'token' | 'none';

export interface PaginationState {
  strategy: PaginationStrategy;
  currentPage: number;
  pageSize: number;
  nextCursor: string | null;
  hasMore: boolean;
  totalProcessed: number;
}

export class PaginationEngine {
  /**
   * Initializes a pagination tracker based on the provider config.
   */
  static initialize(strategy: PaginationStrategy, pageSize = 50): PaginationState {
    return {
      strategy,
      currentPage: 1,
      pageSize,
      nextCursor: null,
      hasMore: true,
      totalProcessed: 0
    };
  }

  /**
   * Evaluates the response to update pagination tracking.
   * Tells the engine if it should continue fetching.
   */
  static evaluateNextStep(
    state: PaginationState, 
    lastResponsePayload: any, 
    headers?: Record<string, string>
  ): PaginationState {
    const nextState = { ...state };

    if (!lastResponsePayload) {
      nextState.hasMore = false;
      return nextState;
    }

    if (state.strategy === 'page') {
      const isArray = Array.isArray(lastResponsePayload);
      const count = isArray ? lastResponsePayload.length : 0;
      
      nextState.totalProcessed += count;
      
      // If we received fewer items than requested, we are at the end
      if (count < state.pageSize || count === 0) {
        nextState.hasMore = false;
      } else {
        nextState.currentPage += 1;
        nextState.hasMore = true;
      }
    } 
    else if (state.strategy === 'cursor') {
      // Look for custom cursor properties in JSON (e.g., paging.next, next_cursor)
      let cursor: string | null = null;
      if (lastResponsePayload && typeof lastResponsePayload === 'object') {
        cursor = lastResponsePayload.next_cursor || 
                 lastResponsePayload.paging?.next || 
                 lastResponsePayload.cursor || 
                 null;
      }

      // Also parse Link header if available
      if (!cursor && headers && headers['link']) {
        const linkHeader = headers['link'];
        const match = linkHeader.match(/<([^>]+)>;\s*rel="next"/);
        if (match) {
          try {
            const url = new URL(match[1]);
            cursor = url.searchParams.get('cursor') || url.searchParams.get('after') || null;
          } catch {
            cursor = match[1]; // fallback to raw URL
          }
        }
      }

      if (cursor) {
        nextState.nextCursor = cursor;
        nextState.currentPage += 1;
        nextState.hasMore = true;
      } else {
        nextState.hasMore = false;
        nextState.nextCursor = null;
      }
    } 
    else if (state.strategy === 'token') {
      // In token based, there's usually a continuation token inside response JSON
      const token = lastResponsePayload?.continuationToken || 
                    lastResponsePayload?.nextPageToken || 
                    null;
      if (token) {
        nextState.nextCursor = token;
        nextState.currentPage += 1;
        nextState.hasMore = true;
      } else {
        nextState.hasMore = false;
        nextState.nextCursor = null;
      }
    } 
    else {
      // Strategy 'none' or unknown: always single page
      nextState.hasMore = false;
    }

    return nextState;
  }
}
