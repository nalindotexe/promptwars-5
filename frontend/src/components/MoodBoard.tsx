import React from 'react';
import { Palette, Sparkles, Compass } from 'lucide-react';
import type { CreativeIdeas } from '../types';

interface MoodBoardProps {
  data: CreativeIdeas;
}

export const MoodBoard: React.FC<MoodBoardProps> = ({ data }) => {
  return (
    <section
      aria-labelledby="moodboard-heading"
      className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-xl space-y-6"
    >
      <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
        <div className="p-2.5 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-400">
          <Palette className="w-5 h-5" aria-hidden="true" />
        </div>
        <div>
          <h2 id="moodboard-heading" className="text-xl font-bold text-slate-100">
            Creative Moodboard & Aesthetics
          </h2>
          <p className="text-xs text-slate-400">
            Curated themes, color schemes, and experiential ideas
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {data.themes.map((theme, index) => (
          <div
            key={index}
            className="flex flex-col justify-between bg-slate-800/40 hover:bg-slate-800/60 border border-slate-700/60 rounded-xl p-5 space-y-5 transition-all shadow-md group"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-pink-500/15 border border-pink-500/30 text-pink-300">
                  Concept 0{index + 1}
                </span>
                <Sparkles className="w-4 h-4 text-pink-400/70 group-hover:text-pink-300 transition-colors" />
              </div>

              <h3 className="text-lg font-bold text-slate-100 leading-snug">
                {theme.theme_name}
              </h3>

              {/* Color Swatches */}
              <div className="space-y-2">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block">
                  Color Harmony
                </span>
                <div
                  className="flex items-center gap-2 flex-wrap"
                  role="list"
                  aria-label={`Color palette for ${theme.theme_name}`}
                >
                  {theme.color_palette.map((color, colorIdx) => (
                    <div
                      key={colorIdx}
                      role="listitem"
                      className="group/swatch relative flex items-center"
                    >
                      <div
                        className="w-7 h-7 rounded-lg shadow-sm border border-slate-700 hover:scale-110 transition-transform"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                      <span className="sr-only">{color}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Experiential Activities */}
              <div className="space-y-2">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Compass className="w-3.5 h-3.5 text-pink-400" />
                  Key Activities
                </span>
                <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside">
                  {theme.activity_ideas.map((act, actIdx) => (
                    <li key={actIdx} className="leading-relaxed">
                      {act}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
