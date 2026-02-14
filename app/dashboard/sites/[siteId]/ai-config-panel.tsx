'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'

interface AiConfig {
  provider: string
  api_key: string
  base_url: string
  model: string
  temperature: number
  max_tokens: number
  system_prompt: string
  input_price: number | null
  output_price: number | null
}

const DEFAULT_CONFIG: AiConfig = {
  provider: 'openrouter',
  api_key: '',
  base_url: 'https://openrouter.ai/api/v1',
  model: '',
  temperature: 0.3,
  max_tokens: 1000,
  system_prompt: '',
  input_price: null,
  output_price: null,
}

const PROVIDER_PRESETS: Record<string, { base_url: string; models: string[] }> = {
  openrouter: {
    base_url: 'https://openrouter.ai/api/v1',
    models: [
      'google/gemma-3-27b-it:free',
      'deepseek/deepseek-r1-0528:free',
      'meta-llama/llama-3.3-70b-instruct:free',
      'openai/gpt-4o-mini',
      'anthropic/claude-3.5-sonnet',
    ],
  },
  openai: {
    base_url: 'https://api.openai.com/v1',
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo'],
  },
  custom: {
    base_url: '',
    models: [],
  },
}

export function AiConfigPanel({ siteId, initialConfig }: { siteId: string; initialConfig?: AiConfig }) {
  const [config, setConfig] = useState<AiConfig>({ ...DEFAULT_CONFIG, ...initialConfig })
  const [saving, setSaving] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const currentPreset = PROVIDER_PRESETS[config.provider] || PROVIDER_PRESETS.custom

  const handleProviderChange = (provider: string) => {
    const preset = PROVIDER_PRESETS[provider] || PROVIDER_PRESETS.custom
    setConfig(prev => ({
      ...prev,
      provider,
      base_url: preset.base_url || prev.base_url,
      model: preset.models[0] || prev.model,
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/sites/${siteId}/ai-config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      toast.success('AI configuration saved!')
    } catch (err: any) {
      toast.error(err.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="card-elevated rounded-xl">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-5 text-left"
      >
        <span className="text-sm font-medium text-foreground">
          {config.model || 'Default model'} via {config.provider}
        </span>
        <svg
          className={`w-4 h-4 text-muted-foreground transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {expanded && (
        <div className="px-5 pb-5 space-y-4 border-t border-border pt-4">
          {/* Provider */}
          <div>
            <label className="text-[13px] font-medium text-foreground">Provider</label>
            <select
              value={config.provider}
              onChange={(e) => handleProviderChange(e.target.value)}
              className="mt-1.5 w-full rounded-[10px] border border-border bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
            >
              <option value="openrouter">OpenRouter</option>
              <option value="openai">OpenAI</option>
              <option value="custom">Custom (OpenAI-compatible)</option>
            </select>
          </div>

          {/* API Key */}
          <div>
            <label className="text-[13px] font-medium text-foreground">API Key</label>
            <p className="text-[11px] text-muted-foreground mt-0.5">Leave empty to use server default</p>
            <input
              type="password"
              value={config.api_key}
              onChange={(e) => setConfig(prev => ({ ...prev, api_key: e.target.value }))}
              className="mt-1.5 w-full rounded-[10px] border border-border bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
              placeholder="sk-..."
            />
          </div>

          {/* Base URL */}
          <div>
            <label className="text-[13px] font-medium text-foreground">Base URL</label>
            <input
              value={config.base_url}
              onChange={(e) => setConfig(prev => ({ ...prev, base_url: e.target.value }))}
              className="mt-1.5 w-full rounded-[10px] border border-border bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
              placeholder="https://api.openai.com/v1"
            />
          </div>

          {/* Model */}
          <div>
            <label className="text-[13px] font-medium text-foreground">Model</label>
            {currentPreset.models.length > 0 ? (
              <select
                value={config.model}
                onChange={(e) => setConfig(prev => ({ ...prev, model: e.target.value }))}
                className="mt-1.5 w-full rounded-[10px] border border-border bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
              >
                {currentPreset.models.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            ) : (
              <input
                value={config.model}
                onChange={(e) => setConfig(prev => ({ ...prev, model: e.target.value }))}
                className="mt-1.5 w-full rounded-[10px] border border-border bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                placeholder="model-name"
              />
            )}
          </div>

          {/* Temperature & Max Tokens */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[13px] font-medium text-foreground">Temperature</label>
              <input
                type="number"
                min={0} max={2} step={0.1}
                value={config.temperature}
                onChange={(e) => setConfig(prev => ({ ...prev, temperature: parseFloat(e.target.value) || 0 }))}
                className="mt-1.5 w-full rounded-[10px] border border-border bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
              />
            </div>
            <div>
              <label className="text-[13px] font-medium text-foreground">Max Tokens</label>
              <input
                type="number"
                min={100} max={16000} step={100}
                value={config.max_tokens}
                onChange={(e) => setConfig(prev => ({ ...prev, max_tokens: parseInt(e.target.value) || 1000 }))}
                className="mt-1.5 w-full rounded-[10px] border border-border bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
              />
            </div>
          </div>

            {/* Pricing ($/1M tokens) */}
            <div>
              <div className="flex items-center gap-2">
                <label className="text-[13px] font-medium text-foreground">Token Pricing ($ / 1M tokens)</label>
                {config.provider === 'custom' && (
                  <span className="text-[11px] bg-amber-50 text-amber-700 border border-amber-200 rounded-md px-1.5 py-0.5 font-medium">Required for cost tracking</span>
                )}
              </div>
              {config.provider === 'custom' && (
                <p className="text-[11px] text-amber-600 mt-0.5">
                  Custom models require input/output pricing to calculate costs in AI Monitor.
                </p>
              )}
              <div className="grid grid-cols-2 gap-4 mt-1.5">
                <div>
                  <label className="text-[11px] text-muted-foreground">Input ($/1M)</label>
                  <input
                    type="number"
                    min={0} step={0.01}
                    value={config.input_price ?? ''}
                    onChange={(e) => setConfig(prev => ({ ...prev, input_price: e.target.value ? parseFloat(e.target.value) : null }))}
                    className="mt-1 w-full rounded-[10px] border border-border bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                    placeholder="e.g. 0.15"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-muted-foreground">Output ($/1M)</label>
                  <input
                    type="number"
                    min={0} step={0.01}
                    value={config.output_price ?? ''}
                    onChange={(e) => setConfig(prev => ({ ...prev, output_price: e.target.value ? parseFloat(e.target.value) : null }))}
                    className="mt-1 w-full rounded-[10px] border border-border bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                    placeholder="e.g. 0.60"
                  />
                </div>
              </div>
            </div>

            {/* System Prompt */}
          <div>
            <label className="text-[13px] font-medium text-foreground">Custom System Prompt</label>
            <p className="text-[11px] text-muted-foreground mt-0.5">Override the default system prompt. Leave empty for default.</p>
            <textarea
              value={config.system_prompt}
              onChange={(e) => setConfig(prev => ({ ...prev, system_prompt: e.target.value }))}
              rows={4}
              className="mt-1.5 w-full rounded-[10px] border border-border bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all resize-none"
              placeholder="You are a helpful assistant that answers based on the provided knowledge base..."
            />
          </div>

          {/* Save */}
          <div className="pt-1">
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-[10px] gradient-bg px-4 py-2 text-[13px] font-medium text-white btn-primary-shadow hover:-translate-y-px transition-all disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
