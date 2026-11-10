"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type ImageStatus = "none" | "loading" | "loaded" | "error";

const AvatarContext = React.createContext<{
  status: ImageStatus;
  setStatus: (status: ImageStatus) => void;
}>({ status: "none", setStatus: () => {} });

const AVATAR_SIZES = {
  xs: "size-5 text-[9px]",
  sm: "size-6 text-2xs",
  default: "size-8 text-xs",
  lg: "size-10 text-base",
  xl: "size-14 text-xl",
};

/**
 * A person or a workspace as a circle: its picture, and its initials until the picture has loaded or when it cannot.
 * The size is fixed before anything loads, so nothing shifts. `square` is for a workspace or a brand, which are
 * tiles rather than faces.
 * It fetches nothing of its own. The picture is a plain <img> with the `src` the page gives, so it is in the
 * server-rendered markup, loads once, and shows without JavaScript; there is no lookup of a picture from an address
 * or a name. The initials are the caller's too: how to shorten a name depends on the language.
 */
function Avatar({
  className,
  size = "default",
  square = false,
  ...props
}: React.ComponentProps<"span"> & { size?: keyof typeof AVATAR_SIZES; square?: boolean }) {
  const [status, setStatus] = React.useState<ImageStatus>("none");
  const context = React.useMemo(() => ({ status, setStatus }), [status]);
  return (
    <AvatarContext.Provider value={context}>
      <span
        data-slot="avatar"
        data-size={size}
        className={cn(
          "relative inline-flex shrink-0 items-center justify-center overflow-hidden bg-muted align-middle font-medium text-muted-foreground select-none",
          square ? "rounded-control" : "rounded-full",
          AVATAR_SIZES[size],
          className,
        )}
        {...props}
      />
    </AvatarContext.Provider>
  );
}

/**
 * The picture. `alt` is required: the person's name where the avatar stands alone, and an empty string where the
 * name is written next to it. A picture that fails to load is removed and the fallback stays.
 */
function AvatarImage({
  className,
  src,
  srcSet,
  alt,
  onLoad,
  onError,
  ...props
}: Omit<React.ComponentProps<"img">, "alt"> & { alt: string }) {
  const { status, setStatus } = React.useContext(AvatarContext);
  const ref = React.useRef<HTMLImageElement>(null);
  // What the picture is loaded from: either prop alone is a picture, as on a native <img>.
  const source = src || srcSet;
  const [failedSrc, setFailedSrc] = React.useState<typeof source>(undefined);

  React.useLayoutEffect(() => {
    // The picture may have loaded or failed before React attached its handlers, as it does on a server-rendered page.
    const image = ref.current;
    if (!source || !image) setStatus("none");
    else if (!image.complete) setStatus("loading");
    else if (image.naturalWidth > 0) setStatus("loaded");
    else {
      setFailedSrc(source);
      setStatus("error");
    }
    return () => setStatus("none");
  }, [source, setStatus]);

  if (!source || (status === "error" && failedSrc === source)) return null;
  return (
    // A registry item cannot depend on a framework's image component; the page passes a URL it has already sized.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={ref}
      data-slot="avatar-image"
      src={src}
      srcSet={srcSet}
      alt={alt}
      className={cn("absolute inset-0 size-full object-cover", className)}
      onLoad={(event) => {
        onLoad?.(event);
        setStatus("loaded");
      }}
      onError={(event) => {
        onError?.(event);
        setFailedSrc(source);
        setStatus("error");
      }}
      {...props}
    />
  );
}

/**
 * The initials, or an icon. Shown until the picture has loaded, then removed, so a picture with transparency does
 * not show them through. While a picture is on its way they are hidden from assistive technology, which already has
 * the picture's alt.
 */
function AvatarFallback({ className, ...props }: React.ComponentProps<"span">) {
  const { status } = React.useContext(AvatarContext);
  if (status === "loaded") return null;
  return (
    <span
      data-slot="avatar-fallback"
      aria-hidden={status === "loading" || undefined}
      className={cn("leading-none [&_svg:not([class*='size-'])]:size-[55%]", className)}
      {...props}
    />
  );
}

/** A row of overlapping avatars, each ringed in the page color so the edges stay apart. */
function AvatarGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="avatar-group"
      className={cn(
        "flex items-center -space-x-1.5 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:ring-background",
        className,
      )}
      {...props}
    />
  );
}

export { Avatar, AvatarImage, AvatarFallback, AvatarGroup };
