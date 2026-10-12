// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { AlertDialog, AlertDialogTrigger } from './alert-dialog';
import { Badge } from './badge';
import { Button } from './button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from './dropdown-menu';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from './sheet';

afterEach(() => {
  cleanup();
});

describe('clickable shadcn components', () => {
  it('should give the Button the pointer cursor in every variant', () => {
    for (const variant of [
      'default',
      'outline',
      'secondary',
      'ghost',
      'destructive',
      'link',
    ] as const) {
      render(<Button variant={variant}>{variant}</Button>);
      expect(screen.getByRole('button', { name: variant }).className).toContain('cursor-pointer');
    }
  });

  it('should let a caller override the cursor of the Button', () => {
    render(<Button className="cursor-not-allowed">Locked</Button>);
    const { className } = screen.getByRole('button', { name: 'Locked' });
    expect(className).toContain('cursor-not-allowed');
    expect(className).not.toContain('cursor-pointer');
  });

  it('should give the pointer cursor to a Badge that is a link and not to a plain Badge', () => {
    render(
      <>
        <Badge asChild>
          <a href="/x">Link badge</a>
        </Badge>
        <Badge>Plain badge</Badge>
      </>,
    );
    // The class is scoped to `a`, so it only applies when the Badge renders a link.
    expect(screen.getByText('Link badge').className).toContain('[a]:cursor-pointer');
    expect(screen.getByText('Plain badge').tagName).toBe('SPAN');
  });

  it('should give the pointer cursor to the trigger and to every item of a dropdown menu', () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Open menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item</DropdownMenuItem>
          <DropdownMenuCheckboxItem checked>Checkbox item</DropdownMenuCheckboxItem>
          <DropdownMenuRadioGroup value="a">
            <DropdownMenuRadioItem value="a">Radio item</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Sub trigger</DropdownMenuSubTrigger>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    // The open menu hides the trigger from the accessibility tree, so find it by its text.
    expect(screen.getByText('Open menu').className).toContain('cursor-pointer');
    for (const text of ['Item', 'Checkbox item', 'Radio item', 'Sub trigger']) {
      const element = screen.getByText(text).closest('[data-slot]');
      expect(element?.className).toContain('cursor-pointer');
      expect(element?.className).not.toContain('cursor-default');
    }
  });

  it('should give the pointer cursor to the trigger of a sheet and of an alert dialog', () => {
    render(
      <>
        <Sheet>
          <SheetTrigger>Open sheet</SheetTrigger>
        </Sheet>
        <AlertDialog>
          <AlertDialogTrigger>Open alert</AlertDialogTrigger>
        </AlertDialog>
      </>,
    );
    expect(screen.getByRole('button', { name: 'Open sheet' }).className).toContain(
      'cursor-pointer',
    );
    expect(screen.getByRole('button', { name: 'Open alert' }).className).toContain(
      'cursor-pointer',
    );
  });

  it('should give the pointer cursor to SheetClose', () => {
    render(
      <Sheet open>
        <SheetContent showCloseButton={false}>
          <SheetTitle>Title</SheetTitle>
          <SheetDescription>Description</SheetDescription>
          <SheetClose>Close sheet</SheetClose>
        </SheetContent>
      </Sheet>,
    );
    expect(screen.getByRole('button', { name: 'Close sheet' }).className).toContain(
      'cursor-pointer',
    );
  });
});
