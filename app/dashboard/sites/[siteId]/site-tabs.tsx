'use client'

import { useState, ReactNode } from 'react'

interface Tab {
  id: string
  label: string
  icon: ReactNode
  content: ReactNode
  badge?: string | number
}

export function SiteTabs({ tabs }: { tabs: Tab[] }) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.id || '')

  return (
    <div>
      {/* Tab Bar */}
      <div className="flex items-center gap-1 border-b border-border mb-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-[13px] font-medium border-b-2 transition-colors -mb-[1px] ${
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
            }`}
          >
            <span className="w-4 h-4">{tab.icon}</span>
            {tab.label}
            {tab.badge !== undefined && tab.badge !== 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-muted text-[10px] font-medium">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tabs.map(tab => (
        <div key={tab.id} className={activeTab === tab.id ? '' : 'hidden'}>
          {tab.content}
        </div>
      ))}
    </div>
  )
}
