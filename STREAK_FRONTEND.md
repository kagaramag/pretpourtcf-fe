# Streak Feature - Frontend Implementation

## Overview
The streak feature frontend provides a beautiful, interactive interface for users to manage their practice streaks, view progress, and earn rewards.

## Files Created

### Services
- **`src/services/streak.ts`** - API client for all streak-related endpoints
  - Types and interfaces
  - API methods for CRUD operations
  - TypeScript definitions

### Components

#### Core Components
- **`src/components/streak/streak-card.tsx`**
  - Displays streak information in a card format
  - Shows progress, stats, rewards, and burn timer
  - Visual indicators for active/burned/completed states
  - Animated flame icon for active streaks

- **`src/components/streak/create-streak-dialog.tsx`**
  - Modal dialog for creating new streaks
  - Explains streak rules and requirements
  - Premium validation
  - Feature highlights with icons

- **`src/components/streak/streak-details-dialog.tsx`**
  - Full streak details in a scrollable dialog
  - Exercise list with completion status
  - All earned rewards
  - Next milestone information
  - Burn timer warnings

- **`src/components/streak/streak-status-widget.tsx`**
  - Compact widget showing active streak status
  - Displayed on main compte page
  - Quick access to streak details
  - Urgent warnings for low time remaining

### Pages
- **`src/app/compte/series/page.tsx`**
  - Main streak management page
  - Premium eligibility check
  - Statistics dashboard
  - Active streak view
  - Streak history with pagination
  - Tab interface for organization

- **`src/app/compte/series/layout.tsx`**
  - Layout and metadata for series route

### Integration
- **Updated `src/app/compte/(account)/page.tsx`**
  - Added streak status widget
  - Added streak feature card with call-to-action
  - Navigation to series page

## Features

### 1. Streak Management Dashboard
Located at `/compte/series`

#### Statistics Overview
- Total streaks created
- Completed streaks count
- Completion rate percentage
- Total rewards earned

#### Active Streak Tab
- Current streak card with live countdown
- Progress bar and exercise count
- Burn deadline timer with urgency indicators
- Latest reward display
- Quick access to details

#### History Tab
- Paginated list of past streaks
- Status badges (completed, burned, expired)
- Click to view full details
- Pagination controls

### 2. Visual Design

#### Color Coding
- **Active Streaks**: Orange/red gradient with pulse animation
- **Completed**: Green/blue accents
- **Burned**: Red tones
- **Expired**: Gray/muted
- **Urgent (≤6h)**: Red alerts with warnings

#### Animations
- Pulse effect on flame icon for active streaks
- Gradient progress bars
- Smooth transitions and hover effects

#### Icons
- 🔥 Flame - Streak identity
- 🏆 Trophy - Points and achievements
- ⚡ Zap - Rewards
- ⏰ Clock - Time remaining
- ✓ Check - Completed exercises
- 👑 Crown - Premium features

### 3. User Experience

#### Premium Gate
- Non-premium users see upgrade prompt
- Clear explanation of benefits
- Direct link to subscription plans
- Crown icon for premium branding

#### Eligibility Checking
- Automatic validation on page load
- Clear messaging when ineligible
- Reasons displayed (no subscription, has active streak)

#### Interactive Elements
- Click cards to view details
- Create streak with guided dialog
- Exercise checklist in details view
- Reward showcase

### 4. Real-time Updates

#### Auto-refresh Data
- Fetches latest streak on mount
- Updates after creating streak
- Pagination state management

#### Live Countdown
- Hours until burn displayed
- Color changes based on urgency
- Visual warnings at 6-hour mark

### 5. Responsive Design
- Mobile-friendly layouts
- Grid adapts to screen size
- Scrollable dialog content
- Touch-friendly buttons

## API Integration

### Endpoints Used
```typescript
GET  /api/streaks/eligibility      // Check if user can create
GET  /api/streaks/active            // Get current streak
POST /api/streaks                   // Create new streak
POST /api/streaks/complete-exercise // Complete exercise
GET  /api/streaks/history           // Paginated history
GET  /api/streaks/stats             // User statistics
```

### Error Handling
- Toast notifications for errors
- Graceful fallbacks for loading states
- User-friendly error messages
- Console logging for debugging

## User Flow

### First Visit (Premium User)
1. User navigates to `/compte`
2. Sees "Séries Premium" card with explanation
3. Clicks "Gérer mes séries"
4. Lands on `/compte/series`
5. Sees stats (all zeros) and "Create" button
6. Clicks "Nouvelle série"
7. Dialog explains rules
8. Confirms creation
9. Streak created with 20 exercises

### Active Streak Management
1. Widget shows on `/compte` page
2. Displays hours remaining
3. Click "Voir" to go to series page
4. View full details in dedicated tab
5. Complete exercises via practice sessions
6. System auto-validates 90% requirement
7. Points increment automatically
8. Rewards unlocked at milestones
9. Countdown timer resets to 12 hours

### Reward Unlocking
1. Complete 3 exercises
2. Backend awards random reward
3. Toast notification shows reward
4. Reward appears in details dialog
5. Reward card with icon and description
6. Next milestone shown (3 more exercises)

### Streak Completion
1. All 20 exercises completed
2. Status changes to "completed"
3. Green badge displayed
4. All rewards viewable
5. Stats updated
6. Moves to history tab

### Streak Burning
1. 12 hours pass without activity
2. Status auto-changes to "burned"
3. Red badge and styling
4. No longer appears as active
5. Moves to history
6. Can create new streak

## Localization
All text is in French:
- "Séries" (Streaks)
- "Gérer mes séries" (Manage my streaks)
- "Nouvelle série" (New streak)
- "Actif/Terminé/Brûlé/Expiré" (Active/Completed/Burned/Expired)
- "Récompenses" (Rewards)
- "Exercices" (Exercises)

## Future Enhancements

### Planned Features
- Push notifications for burn warnings
- Share achievements on social media
- Leaderboard integration
- Streak recovery option
- Custom streak durations
- Animation on reward unlock
- Confetti effect on completion
- Weekly/monthly streak challenges
- Streak insights and analytics

### Technical Improvements
- Real-time WebSocket updates
- Optimistic UI updates
- Service worker for offline support
- Progressive Web App features
- Image optimization for rewards
- Accessibility improvements (ARIA labels)
- Keyboard navigation support

## Testing Checklist

### Premium User
- ✓ Can access series page
- ✓ Can create streak
- ✓ See active streak widget
- ✓ View streak details
- ✓ See statistics
- ✓ View history

### Non-Premium User
- ✓ See upgrade prompt
- ✓ Cannot create streak
- ✓ No active streak widget
- ✓ Link to subscription plans

### Active Streak
- ✓ Progress bar updates
- ✓ Hours countdown accurate
- ✓ Urgent warnings at 6h
- ✓ Exercise list shows status
- ✓ Rewards display correctly
- ✓ Next milestone shown

### Streak States
- ✓ Active styling
- ✓ Completed styling
- ✓ Burned styling
- ✓ Expired styling

## Dependencies

### Required Packages
- `date-fns` - Date formatting and calculations
- `lucide-react` - Icon library
- `sonner` - Toast notifications
- Existing UI components (shadcn/ui)

### UI Components Used
- Card, CardContent, CardHeader, CardTitle
- Button
- Dialog, DialogContent, DialogHeader
- Badge
- Progress
- Tabs, TabsContent, TabsList
- Alert, AlertDescription
- ScrollArea

## Browser Support
- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Considerations
- Lazy loading of streak details
- Pagination for history
- Memoization of components (future)
- Debounced API calls
- Optimized re-renders

## Accessibility
- Semantic HTML structure
- Proper heading hierarchy
- Color contrast ratios met
- Focus indicators
- Screen reader friendly
- Keyboard navigation (to improve)

## Known Limitations
1. No real-time updates (requires refresh)
2. No offline support
3. Limited to 10 items per history page
4. Desktop-optimized (mobile can improve)
5. No animation on reward unlock

## Support
For issues or questions about the streak frontend:
1. Check browser console for errors
2. Verify API endpoints are working
3. Ensure user has premium subscription
4. Check network tab for failed requests
5. Review backend logs if needed
