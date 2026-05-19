/**
 * Edit page - drag-and-drop sticker reordering with emoji editing.
 */

import React, { useEffect, useReducer, useState } from 'react';

import {
  DndContext,
  closestCenter,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';

import {
  arrayMove,
  SortableContext,
  rectSortingStrategy,
} from '@dnd-kit/sortable';

import { StickerGrid } from '../components/StickerGrid';
import { SortableSticker } from '../components/Sticker/SortableSticker';
import { Sticker } from '../components/Sticker';
import { ErrorMessage } from '../components/ErrorMessage';
import {
  fetchStickersForEdit,
  submitEditResult,
  submitIndexChange,
  getTelegramIds,
} from '../api/stickerApi';
import { hapticFeedback, getPlatform } from '../hooks/useTelegramInit';
import { GRID_COLUMNS, DRAG_DELAY, DRAG_TOLERANCE } from '../constants';

function Edit() {
  const [items, setItems] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { delay: DRAG_DELAY },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: DRAG_DELAY, tolerance: DRAG_TOLERANCE },
    })
  );

  useEffect(() => {
    const { uid, qid } = getTelegramIds();

    fetchStickersForEdit(uid, qid)
      .then((res) => setItems(res.data.ss))
      .catch(() => {});

    window.Telegram.WebApp.MainButton.setText('Done/完成').show().onClick(() => {
      const { uid, qid } = getTelegramIds();
      submitEditResult(uid, qid, items)
        .then(() => window.Telegram.WebApp.close())
        .catch((error) => {
          const msg = error.response
            ? `${error}\n${error.response.data}`
            : String(error);
          window.Telegram.WebApp.showAlert(msg);
        });
    });

    // Android specific bug fix:
    // Expanding by swiping up can freeze dnd-context.
    if (getPlatform() === 'android') {
      window.Telegram.WebApp.expand();
    }
  }, []);

  if (items === null) {
    return <p>Please wait...</p>;
  }

  if (items.length === 0) {
    return (
      <ErrorMessage
        message="Please launch WebApp through /manage command."
        messageCn="請使用 /manage 指令後打開WebApp。"
      />
    );
  }

  return (
    <div>
      <h3>Please hold and drag to reorder</h3>
      <h3>請按住並拖拽來排序</h3>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <SortableContext items={items} strategy={rectSortingStrategy}>
          <StickerGrid columns={GRID_COLUMNS}>
            {items.map((item) => (
              <SortableSticker
                key={item.id}
                id={item.id}
                emoji={item.emoji}
                onEmojiChange={setEmoji}
                surl={item.surl}
              />
            ))}
          </StickerGrid>
        </SortableContext>

        <DragOverlay adjustScale={true}>
          {activeId ? (
            <Sticker
              id={activeId}
              surl={items[items.findIndex((o) => o.id === activeId)].surl}
              emoji={items[items.findIndex((o) => o.id === activeId)].emoji}
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );

  function handleDragStart(event) {
    setActiveId(event.active.id);
    hapticFeedback('heavy');
  }

  function handleDragEnd(event) {
    const { active, over } = event;
    if (active.id !== over.id) {
      setItems((prev) => {
        const oldIndex = prev.findIndex((o) => o.id === active.id);
        const newIndex = prev.findIndex((o) => o.id === over.id);
        // Submit before committing state change (prev is pre-move)
        apiSubmitIndexChange(oldIndex, newIndex, prev);
        const newArray = arrayMove(prev, oldIndex, newIndex);
        return newArray;
      });
    }
    setActiveId(null);
    hapticFeedback('soft');
  }

  function handleDragCancel() {
    setActiveId(null);
  }

  function setEmoji(id, value) {
    setItems((prev) => {
      const newItems = [...prev];
      const pos = newItems.findIndex((o) => o.id === id);
      newItems[pos] = { ...newItems[pos], emoji: value, emoji_changed: true };
      return newItems;
    });
    forceUpdate();
  }

  function apiSubmitIndexChange(oldIndex, newIndex, currentItems) {
    const { uid, qid } = getTelegramIds();
    submitIndexChange(uid, qid, oldIndex, newIndex)
      .then(() => console.log('pos mov ok.'))
      .catch((err) => {
        console.log('pos mov failed!');
        setItems(currentItems); // Revert
        window.Telegram.WebApp.showAlert(
          `${err}\n${err.response?.data}\nChange reverted, please try again`
        );
      });
  }
}

export default Edit;
