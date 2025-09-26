"use client"

import React, { useState } from 'react'

import { useParams } from 'next/navigation'

import Grid from '@mui/material/Grid'

import CardStatVertical from '@components/card-statistics/Vertical'
import CardSelection from '@/components/select/CardSelection' // or MultipleSelectChip

const DashboardCards = ({ data }) => {
  const { lang: locale } = useParams()
  const [assetName, setAssetName] = useState([])

  // All cards mapped by title
  const assetMap = {
    'Total Assets': {
      stats: data.total_asset,
      title: 'Total Assets',
      avatarColor: 'primary',
      avatarIcon: 'ri-database-2-line',
      link: '/asset-managements/asset-list'
    },
    'Total Tickets': {
      stats: data.total_tickets,
      title: 'Total Tickets',
      avatarColor: 'warning',
      avatarIcon: 'ri-ticket-line',
      link: '/ticket/ticket-list'
    },
    'Total Audits': {
      stats: data.total_config,
      title: 'Total Audits',
      avatarColor: 'info',
      avatarIcon: 'ri-search-eye-line',
      link: '/assetAudit/audit-config'
    },
    'Total Discards': {
      stats: data.total_discard,
      title: 'Total Discards',
      avatarColor: 'error',
      avatarIcon: 'ri-delete-bin-line',
      link: '/assetreports/discard-report'
    }
  }

  // If nothing selected, show all
  const assetsToRender = assetName.length > 0 ? assetName : Object.keys(assetMap)

  return (
    <>
      <CardSelection assetName={assetName} setAssetName={setAssetName} className='mb-4' />

      <Grid container spacing={4} sx={{ paddingRight: '4px' }}>
        {assetsToRender.map((name) => {
          const card = assetMap[name]

          return (
            <Grid item xs={12} sm={6} md={3} key={name}>
              <CardStatVertical
                stats={card.stats}
                title={card.title}
                avatarColor={card.avatarColor}
                avatarIcon={card.avatarIcon}
                avatarSkin="light"
                link={card.link}
              />
            </Grid>
          )
        })}
      </Grid>
    </>
  )
}

export default DashboardCards
