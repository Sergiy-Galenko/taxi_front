import React from 'react';
import { ScreenContainer } from '../../design-system/components/ui';
export default function AuthScreenFrame({ children, scroll = true }: { children: React.ReactNode; scroll?: boolean }) { return <ScreenContainer scroll={scroll}>{children}</ScreenContainer>; }
