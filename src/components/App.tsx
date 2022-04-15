import React from 'react';

import Header from 'components/Header';
import Toolbar from 'components/Toolbar';
import Graph, { ImperativeCanvasRef } from 'components/Graph';
import Sidebar from 'components/Sidebar';
import ExprList from 'components/ExprList';
import NewExpression from 'components/NewExpression';
import Keypad from 'components/Keypad';
import GraphControls from 'components/GraphControls';

import useWindowSize from 'hooks/useWindowSize';
import useDraggablePosition from 'hooks/useDraggablePosition';
import useExprs from 'hooks/useExprs';

import 'styles/App.css';
import 'react-resizable/css/styles.css';

// The MathQuill library is loaded through <script> tags, so we declare
// the exposed MathQuill object here so that TypeScript is happy
const { MQ } = window;

// These aren't used to actually set the header/keypad height;
// they are only symbolic constants.
// The actual header/keypad height is controlled in CSS (App.css and Keypad.css)
const headerHeight = 46;
const keypadHeight = 150;

function App() {
  const {
    exprs, // state array containing information for all current expressions
    focusedID, // ID of the expression that currently has focus
    loadExprs, // import an array of expressions
    reorderExprs, // swap two expressions in the array (affects ordering in expression list)
    newExpr, // create a new expression and add it to the expression list
    insertTex, // insert a TeX string into an expression
    animateExpr, // start the animation of an expression
    generateCallbacks, // create callbacks for an expression
  } = useExprs();
  const windowSize = useWindowSize();
  // reference to a canvas interface that can interact with the graph canvas
  // (interface defined in ImperativeCanvasRef)
  const canvasRef = React.createRef<ImperativeCanvasRef>();
  // x-coordinate of the sidebar and callback for sidebar dragging (to expand/shrink the sidebar)
  const {
    position: sidebarPosition,
    setPosition: setSidebarPosition,
    onDragStart: onSidebarDragStart,
  } = useDraggablePosition(
    { x: 350, y: 0 },
    { x: 300, y: -Infinity }, // minimum
    { x: windowSize.width * 9 / 10, y: Infinity }, // maximum
  );
  // flags controlling the visibility of the bottom keyboard
  const [keypadVisible, setKeypadVisible] = React.useState(false);

  // MathQuill library initialization
  React.useEffect(() => {
    MQ.config({
      autoCommands: 'pi theta sqrt sum times cdot', // command is automatically replaced with symbol
      autoOperatorNames: 'sin cos tan csc sec cot arcsin arccos arctan log ln '
        + 'det eigenvalues eigenvectors cross proj comp norm inv', // operators formatted as functions (non-italicized)
    });
  }, []);

  // Calculate the height of the sidebar from the window size, the header size, and whether or not
  // the keypad is visible
  const sidebarHeight = windowSize.height - headerHeight - (keypadVisible ? keypadHeight : 0);

  // Generate a list of expressions from the `exprs` state array that should be drawn on the graph.
  // (expressions that have been evaluated to a value
  // and have not been toggled as invisible by the user)
  const drawableExprs = exprs.filter(
    (exprData) => exprData.visible && exprData.evaluatedValue !== null,
  );

  // Insert a TeX expression at the cursor into the expression that currently has focus.
  const insertTexInFocused = (tex: string) => insertTex(focusedID, tex);

  // Center the graph at the origin.
  const centerGraph = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.centerGraph();
  };

  // Prompt the user to download the currently visible graph as a PNG.
  const exportGraphPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.exportGraphPNG();
  };

  // Serialize the `exprs` state array as JSON and encode it in Base64.
  const exportExprs = () => {
    // MathJS evaluations don't entirely copy when stringified,
    // so we remove them in the export to save characters in the encoding
    // and re-evaluate on import
    const exprsWithoutEval = exprs.map((exprData) => ({ ...exprData, evaluatedValue: null }));
    return btoa(JSON.stringify(exprsWithoutEval));
  };
  // Decode an encoded `exprs` state array and load it into the current `exprs` state
  const importExprs = (exprsBase64: string) => {
    const exprsObject = JSON.parse(atob(exprsBase64));
    // loadExprs will re-evaluate the stripped evaluations
    loadExprs(exprsObject);
  };

  const setSidebarWidth = (width: number) => setSidebarPosition({ x: width, y: 0 });
  const sidebarHidden = sidebarPosition.x <= 0;

  return (
    <>
      <Header
        exportExprs={exportExprs}
        importExprs={importExprs}
        exportGraphPNG={exportGraphPNG}
      />
      <div id="app">
        <Sidebar
          width={sidebarPosition.x}
          setWidth={setSidebarWidth}
          height={sidebarHeight}
          onResizerClick={onSidebarDragStart}
          header={<Toolbar newExpr={newExpr} hideSidebar={() => setSidebarWidth(0)} />}
        >
          <ExprList
            exprs={exprs}
            focusedID={focusedID}
            reorderExprs={reorderExprs}
            generateCallbacks={generateCallbacks}
          />
          <NewExpression onClick={() => newExpr('math')} />
        </Sidebar>
        <Graph
          ref={canvasRef}
          width={windowSize.width - sidebarPosition.x}
          height={sidebarHeight}
          exprs={drawableExprs}
          animateExpr={animateExpr}
        />
        <GraphControls centerGraph={centerGraph} />
        {!sidebarHidden && (
          <Keypad
            keypadVisible={keypadVisible}
            setKeypadVisible={setKeypadVisible}
            insertTex={insertTexInFocused}
          />
        )}
      </div>
    </>
  );
}

export default App;
