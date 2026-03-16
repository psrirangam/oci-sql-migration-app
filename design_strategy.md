# OCI SQL Server Migration Questionnaire - Design Strategy

## Design Philosophy: Enterprise Professional with Oracle Brand Integration

This application embodies an **enterprise-grade professional aesthetic** that communicates trust, expertise, and technical sophistication. The design reflects Oracle's brand identity while maintaining clarity and accessibility for complex technical assessments.

### Core Design Principles

1. **Technical Authority**: The interface conveys expertise through clean typography, structured layouts, and purposeful use of whitespace. Users should feel they're engaging with a sophisticated tool built by professionals.

2. **Progressive Disclosure**: Complex information is revealed progressively through the questionnaire flow, preventing cognitive overload while maintaining engagement.

3. **Visual Hierarchy**: Strategic use of typography, color, and spacing guides users through the assessment journey with clear visual landmarks.

4. **Trust Through Clarity**: Every element serves a purpose. No decorative clutter—only functional design that builds confidence in the assessment process.

### Color Palette

- **Primary**: Oracle Red (#FF6B35) - Used for primary CTAs, progress indicators, and key highlights
- **Secondary**: Oracle Blue (#0051BA) - Used for secondary actions and informational elements
- **Neutral Base**: Deep Charcoal (#1A1A1A) for text, Light Slate (#F5F7FA) for backgrounds
- **Accent**: Oracle Gold (#FFB81C) - Used sparingly for important highlights and success states

### Typography System

- **Display Font**: "Sora" (bold, 700 weight) - For main headings and section titles, conveying strength and clarity
- **Body Font**: "Inter" (regular 400, medium 500, semibold 600) - For body text, labels, and interface elements
- **Monospace**: "JetBrains Mono" - For technical terms and code snippets

### Layout Paradigm

The questionnaire uses a **progressive card-based layout** with:
- Left sidebar showing progress and question categories (on desktop)
- Main content area featuring one question per card
- Smooth transitions between questions
- Clear progress visualization at the top

### Signature Elements

1. **Progress Ring**: A circular progress indicator at the top showing assessment completion percentage
2. **Question Cards**: Elevated cards with subtle shadows and hover effects
3. **Oracle Branding**: Subtle Oracle logo and brand colors integrated throughout
4. **Recommendation Panel**: A dedicated section for displaying personalized recommendations with visual indicators

### Interaction Philosophy

- **Smooth Transitions**: Questions fade in/out as users navigate
- **Immediate Feedback**: Selected options are highlighted with clear visual states
- **Hover Effects**: Subtle lift and color changes on interactive elements
- **Loading States**: Elegant spinners when generating recommendations

### Animation Guidelines

- **Entrance**: Fade-in + slight scale (0.95 → 1.0) over 300ms for new questions
- **Transitions**: Smooth 200ms transitions for color and opacity changes
- **Progress Updates**: Animated progress ring updates as users advance
- **Recommendations**: Staggered fade-in of recommendation cards (100ms stagger)

## Implementation Notes

- Use Tailwind CSS with custom theme colors defined in `index.css`
- Leverage shadcn/ui components for consistency
- Implement responsive design with mobile-first approach
- Ensure accessibility with proper ARIA labels and keyboard navigation
