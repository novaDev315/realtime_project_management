'use client'

import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core'
import { arrayMove, SortableContext } from '@dnd-kit/sortable'
import { RootState } from '@/store/store'
import { moveCard, updateCard } from '@/store/slices/boardSlice'
import { useBoardSocket } from '@/hooks/useSocket'
import { Card as CardType } from '@/store/slices/boardSlice'
import BoardColumn from './BoardColumn'
import CardItem from '../Card/CardItem'
import CursorOverlay from './CursorOverlay'

interface KanbanBoardProps {
  boardId: string
}

export default function KanbanBoard({ boardId }: KanbanBoardProps) {
  const dispatch = useDispatch()
  const { currentBoard } = useSelector((state: RootState) => state.board)
  const { user } = useSelector((state: RootState) => state.auth)
  const socket = useBoardSocket(boardId)
  const [activeCard, setActiveCard] = React.useState<CardType | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  useEffect(() => {
    // Listen for real-time card updates
    socket.on('card:created', (data: any) => {
      // Dispatch action to add card to store
      console.log('Card created:', data)
    })

    socket.on('card:updated', (data: any) => {
      dispatch(updateCard(data.card))
    })

    socket.on('card:moved', (data: any) => {
      dispatch(
        moveCard({
          cardId: data.cardId,
          sourceColumnId: data.sourceColumnId,
          targetColumnId: data.targetColumnId,
          position: data.position,
        })
      )
    })

    return () => {
      socket.off('card:created')
      socket.off('card:updated')
      socket.off('card:moved')
    }
  }, [socket, dispatch])

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const card = findCard(active.id as string)
    setActiveCard(card)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over) {
      setActiveCard(null)
      return
    }

    const activeCard = findCard(active.id as string)
    const overColumn = findColumnByCardOrId(over.id as string)

    if (!activeCard || !overColumn) {
      setActiveCard(null)
      return
    }

    const sourceColumn = currentBoard?.columns.find((col) =>
      col.cards.some((c) => c._id === activeCard._id)
    )

    if (!sourceColumn) {
      setActiveCard(null)
      return
    }

    // Calculate new position
    const overIndex = overColumn.cards.findIndex((c) => c._id === over.id)
    const newPosition = overIndex >= 0 ? overIndex : overColumn.cards.length

    // Emit socket event
    socket.moveCard({
      cardId: activeCard._id,
      sourceColumnId: sourceColumn._id,
      targetColumnId: overColumn._id,
      position: newPosition,
      boardId,
    })

    // Update local state
    dispatch(
      moveCard({
        cardId: activeCard._id,
        sourceColumnId: sourceColumn._id,
        targetColumnId: overColumn._id,
        position: newPosition,
      })
    )

    setActiveCard(null)
  }

  const findCard = (cardId: string): CardType | null => {
    if (!currentBoard) return null

    for (const column of currentBoard.columns) {
      const card = column.cards.find((c) => c._id === cardId)
      if (card) return card
    }

    return null
  }

  const findColumnByCardOrId = (id: string) => {
    if (!currentBoard) return null

    // Check if it's a column ID
    const columnById = currentBoard.columns.find((col) => col._id === id)
    if (columnById) return columnById

    // Check if it's a card ID
    for (const column of currentBoard.columns) {
      if (column.cards.some((c) => c._id === id)) {
        return column
      }
    }

    return null
  }

  if (!currentBoard) {
    return <div className="p-8 text-center">Loading board...</div>
  }

  return (
    <div className="relative h-full">
      <CursorOverlay boardId={boardId} currentUserId={user?.id || ''} />
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 p-6 overflow-x-auto h-full">
          {currentBoard.columns.map((column) => (
            <BoardColumn key={column._id} column={column} boardId={boardId} />
          ))}
        </div>

        <DragOverlay>
          {activeCard ? <CardItem card={activeCard} isDragging /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
