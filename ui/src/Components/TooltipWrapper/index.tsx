import React, { useState, useEffect, ReactNode, FC } from "react";
import { createPortal } from "react-dom";

import { usePopper } from "react-popper";

import { useSupportsTouch } from "Hooks/useSupportsTouch";

const TooltipWrapper: FC<{
  title: ReactNode;
  children: ReactNode;
  className?: string;
}> = ({ title, children, className }) => {
  const [referenceElement, setReferenceElement] = useState(
    null as HTMLElement | null
  );
  const [popperElement, setPopperElement] = useState(
    null as HTMLElement | null
  );
  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    placement: "top",
    modifiers: [
      {
        name: "preventOverflow",
        options: {
          rootBoundary: "viewport",
        },
      },
    ],
  });

  const supportsTouch = useSupportsTouch();
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [wasClicked, setWasClicked] = useState(false);

  const showTooltip = () => setIsHovering(true);
  const hideTooltip = () => setIsHovering(false);

  useEffect(() => {
    let timerShow: number | undefined;
    let timerHide: number | undefined;

    if (!isHovering) {
      if (isVisible) {
        window.clearTimeout(timerShow);
        timerHide = window.setTimeout(() => setIsVisible(false), 100);
      }
      setWasClicked(false);
    } else if (wasClicked) {
      window.clearTimeout(timerShow);
      window.clearTimeout(timerHide);
      setIsVisible(false);
    } else if (!isVisible && isHovering) {
      clearTimeout(timerHide);
      timerShow = window.setTimeout(() => setIsVisible(true), 1000);
    }
    return () => {
      clearTimeout(timerShow);
      clearTimeout(timerHide);
    };
  }, [isHovering, isVisible, wasClicked]);

  return (
    <React.Fragment>
      <div
        onClick={() => setWasClicked(true)}
        onMouseOver={supportsTouch ? undefined : showTooltip}
        onMouseLeave={supportsTouch ? undefined : hideTooltip}
        onTouchStart={supportsTouch ? showTooltip : undefined}
        onTouchCancel={supportsTouch ? hideTooltip : undefined}
        onTouchEnd={supportsTouch ? hideTooltip : undefined}
        ref={setReferenceElement}
        style={{ display: "inline-block", maxWidth: "100%" }}
        className={`${className ? className : ""} tooltip-trigger`}
      >
        {children}
      </div>
      {isVisible
        ? createPortal(
            <div
              className="tooltip show tooltip-inner"
              ref={setPopperElement}
              style={{
                willChange: "opacity",
                transition: "opacity 0.2s",
                ...styles.popper,
              }}
              {...attributes.popper}
            >
              {title}
            </div>,
            document.body
          )
        : null}
    </React.Fragment>
  );
};

export { TooltipWrapper };
