import type { ActionSuggestion } from '../api/ai';
import type { ComponentEvent } from '../types/event';

export function toComponentEvent(suggestion: ActionSuggestion): ComponentEvent {
  return {
    eventType: suggestion.eventType as ComponentEvent['eventType'],
    actionType: suggestion.actionType,
    actionConfig: suggestion.actionConfig,
  };
}
