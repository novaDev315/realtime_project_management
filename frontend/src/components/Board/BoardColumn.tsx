'use client'

import React from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Button, Badge } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { Column } from '@/store/slices/boardSlice'
import CardItem from '../Card/CardItem'

interface BoardColumnProps {
  column: Column
  boardId: string
}

export default function BoardColumn({ column, boardId }: BoardColumnProps) {
  const { setNodeRef } = useDroppable({
    id: column._id,
  })

  const cardIds = column.cards.map((card) => card._id)

  return (
    <div className="bg-gray-100 rounded-lg p-4 min-w-[300px] max-w-[300px] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-lg">{column.name}</h3>
          <Badge count={column.cards.length} style={{ backgroundColor: '#52c41a' }} />
        </div>
        <Button
          type="text"
          icon={<PlusOutlined />}
          size="small"
          onClick={() => {
            // Open create card modal
            console.log('Create card in column:', column._id)
          }}
        />
      </div>

      <div
        ref={setNodeRef}
        className="flex-1 space-y-3 overflow-y-auto"
        style={{ minHeight: '200px' }}
      >
        <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
          {column.cards.map((card) => (
            <CardItem key={card._id} card={card} />
          ))}
        </SortableContext>

        {column.cards.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <p>No cards yet</p>
            <p className="text-sm">Drag cards here or click + to add</p>
          </div>
        )}
      </div>
    </div>
  )
}
