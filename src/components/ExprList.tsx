import React from 'react';

import {
  DragDropContext,
  Droppable,
  DroppableProvided,
  Draggable,
  DraggableProvided,
  DropResult,
} from 'react-beautiful-dnd';

import Expr from 'components/Expr';
import { ExprData, ExprOptionChangeFunc, ExprSliderOptionChangeFunc } from 'hooks/useExprs';

export interface ExprListProps {
  exprs: ExprData[];
  // the currently focused expression
  focusedID: number;
  // function to swap the position of 2 expressions in the list
  reorderExprs: (idx1: number, idx2: number) => void;
  // function to generate callbacks for an expression of the specified ID
  generateCallbacks: (id: number) => {
    input: (tex: string) => void,
    focus: () => void,
    delete: () => void,
    animate: () => void,
    optionChange: ExprOptionChangeFunc,
    sliderOptionChange: ExprSliderOptionChangeFunc,
  }
}

export default function ExprList({
  exprs,
  focusedID,
  reorderExprs,
  generateCallbacks,
}: ExprListProps) {
  // drag-and-drop reorder handler
  function onDragEnd(result: DropResult) {
    // dropped outside the list
    if (!result.destination) {
      return;
    }
    reorderExprs(result.source.index, result.destination.index);
  }

  // generate <Expr /> components from stateful expression data `exprs`
  const exprComponents = (
    <>
      {exprs.map((exprData, idx) => {
        const { id } = exprData;
        const idStr = id.toString();
        return (
          <Draggable key={idStr} draggableId={idStr} index={idx}>
            {(provided: DraggableProvided) => (
              <div
                ref={provided.innerRef}
                {...provided.draggableProps}
              >
                <Expr
                  focused={id === focusedID}
                  exprData={exprData}
                  dragHandleProps={provided.dragHandleProps}
                  callbacks={generateCallbacks(id)}
                  key={id}
                />
              </div>
            )}
          </Draggable>
        );
      })}
    </>
  );
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="droppable-exprs">
        {(provided: DroppableProvided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {exprComponents}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
