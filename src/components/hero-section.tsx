import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import heroChef from "@/assets/hero-chef.jpg";
import logo from "/logo.png";

// Official Telegram Icon Component
const TelegramIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-label="Telegram"
  >
    <path
      d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0z"
      fill="#0088CC"
    />
    <path
      d="M17.472 8.403l-1.84 8.66c-.135.603-.48.75-.976.467l-2.7-1.99-1.303 1.254c-.145.145-.27.27-.554.27l.197-2.79 5.002-4.52c.218-.194-.048-.3-.337-.108l-6.18 3.89-2.66-.833c-.578-.18-.594-.578.12-.87l10.35-3.99c.48-.18.9.12.744.87z"
      fill="#FFFFFF"
    />
  </svg>
);

interface HeroSectionProps {
  onGetStarted: () => void;
  onViewExamples?: () => void;
}

export const HeroSection = ({ onGetStarted, onViewExamples }: HeroSectionProps) => {
  return (
    <section className="relative h-auto py-12 sm:py-20 md:py-32 flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-hero opacity-60"></div>
      
      {/* Enhanced floating elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-mint/20 rounded-full animate-float"></div>
      <div className="absolute top-32 right-16 w-16 h-16 bg-sage/20 rounded-full animate-float" style={{ animationDelay: "1s" }}></div>
      <div className="absolute bottom-32 left-20 w-24 h-24 bg-accent/20 rounded-full animate-float" style={{ animationDelay: "2s" }}></div>
      
      {/* New animated elements */}
      <div className="absolute top-1/4 right-1/3 w-8 h-8 bg-primary/30 rounded-full animate-bounce-slow"></div>
      <div className="absolute bottom-1/4 left-1/4 w-12 h-12 bg-leaf/20 rounded-full animate-spin-slow"></div>
      <div className="absolute top-3/4 right-1/4 w-6 h-6 bg-forest/30 rounded-full animate-wiggle"></div>
      
      {/* Floating icons */}
      <div className="absolute top-40 left-1/3 text-primary/20 animate-float" style={{ animationDelay: "3s" }}>
        <Sparkles className="w-8 h-8" />
      </div>
      <div className="absolute bottom-40 right-1/3 text-accent/30 animate-bounce-slow" style={{ animationDelay: "4s" }}>
        <Sparkles className="w-6 h-6" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 items-center">
          
          {/* Content */}
          <div className="space-y-6 lg:space-y-8 text-center lg:text-left animate-fade-up">
            <div className="space-y-3 lg:space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                Powered by AI
              </div>
              
              <div className="flex flex-col items-center lg:items-start gap-10">
                <div className="flex items-center gap-8">
                  <img 
                    src={logo} 
                    alt="Windexs логотип" 
                    className="h-56 sm:h-72 md:h-80 lg:h-[26rem] w-auto max-w-full drop-shadow-2xl"
                  />
                  <span className="text-4xl sm:text-5xl md:text-6xl font-semibold text-foreground drop-shadow-2xl">
                    кулинар
                  </span>
                </div>
                <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-semibold text-foreground leading-tight drop-shadow-lg">
                  Ваш умный кулинарный помощник с искусственным интеллектом
                </h1>
              </div>
              
              <p className="text-base sm:text-lg md:text-xl text-foreground/90 max-w-lg mx-auto lg:mx-0 leading-relaxed drop-shadow-md">
                Превратите любые ингредиенты в кулинарные шедевры с помощью искусственного интеллекта
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:gap-4 items-center lg:items-start">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start w-full sm:w-auto">
                <Button 
                  size="lg" 
                  onClick={onGetStarted}
                  className="bg-gradient-primary hover:opacity-90 transition-opacity shadow-glow text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 animate-pulse-glow"
                >
                  Создать рецепт
                  <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
                
                <Button
                  size="lg"
                  variant="secondary"
                  onClick={onViewExamples}
                  className="text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 hover:bg-secondary/80 transition-colors drop-shadow-md"
                >
                  Посмотреть примеры
                </Button>
              </div>

              <div className="w-full sm:w-auto flex justify-center lg:justify-start">
                <Button
                  asChild
                  size="lg"
                  variant="ghost"
                  className="text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 hover:bg-transparent transition-colors drop-shadow-md bg-transparent"
                >
                  <a href="https://t.me/WindexsGroup" target="_blank" rel="noreferrer">
                    <span className="flex items-center gap-2">
                      <TelegramIcon className="w-8 h-8 sm:w-10 sm:h-10" />
                      <span>Спросить</span>
                    </span>
                  </a>
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 sm:gap-6 lg:gap-8 pt-6 sm:pt-8 border-t border-border/50">
              <div className="text-center">
                <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-primary drop-shadow-md">1000+</div>
                <div className="text-xs sm:text-sm text-foreground/80 drop-shadow-sm">Рецептов</div>
              </div>
              <div className="text-center">
                <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-primary drop-shadow-md">50k+</div>
                <div className="text-xs sm:text-sm text-foreground/80 drop-shadow-sm">Пользователей</div>
              </div>
              <div className="text-center">
                <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-primary drop-shadow-md">98%</div>
                <div className="text-xs sm:text-sm text-foreground/80 drop-shadow-sm">Удовлетворены</div>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative animate-fade-up" style={{ animationDelay: "0.2s" }}>
            <div className="relative z-10">
              <img 
                src={heroChef} 
                alt="AI Chef Assistant" 
                className="w-full h-auto rounded-2xl shadow-glow animate-float"
              />
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-gradient-primary rounded-full opacity-20 animate-pulse-glow"></div>
            <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-accent/30 rounded-full animate-float" style={{ animationDelay: "3s" }}></div>
            
            {/* Additional floating decorations */}
            <div className="absolute -top-4 -left-4 w-16 h-16 bg-mint/20 rounded-full animate-wiggle"></div>
            <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-sage/20 rounded-full animate-bounce-slow"></div>
          </div>
        </div>
      </div>
    </section>
  );
};