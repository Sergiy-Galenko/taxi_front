// Compatibility entry point for screens outside the active navigation tree.
import React from 'react';
import { AppInput, AppInputProps } from '../design-system/components/ui';
export function CustomInput({ icon: _icon, ...props }: Omit<AppInputProps, 'icon'> & { icon?: string }) { return <AppInput {...props} />; }
