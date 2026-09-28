import { HeroCarousel } from '../components/hero/HeroCarousel.js';
import { ProductHighlights } from '../components/sections/ProductHighlights.js';
import { NutritionSnapshot } from '../components/sections/NutritionSnapshot.js';
import { RoutineSection } from '../components/sections/RoutineSection.js';
import { QualityPreview } from '../components/sections/QualityPreview.js';
import { PackVerification } from '../components/sections/PackVerification.js';
import { JournalPreview } from '../components/sections/JournalPreview.js';
import { FaqPreview } from '../components/sections/FaqPreview.js';

export function HomePage(state) {
  return `${HeroCarousel(state.heroSlide)}${ProductHighlights()}${NutritionSnapshot()}${RoutineSection()}${QualityPreview()}${PackVerification()}${JournalPreview()}${FaqPreview()}`;
}
