import React from 'react';
import { Image, View, Text, StyleSheet } from 'react-native';

interface LogoProps {
  size?: number;
  showText?: boolean;
}

const logoSource = require('../assets/images/logo.jpg');
const iconSource = require('../assets/images/logo-icon.jpg');

export function ZabratLogo({ size = 32, showText = false }: LogoProps) {
  return (
    <Image source={logoSource} style={{ width: size * 3, height: size }} resizeMode="contain" />
  );
}

export function ZabratIcon({ size = 32 }: { size?: number }) {
  return (
    <Image source={logoSource} style={{ width: size, height: size }} resizeMode="contain" />
  );
}

export function ZabratAppIcon({ size = 80 }: { size?: number }) {
  return (
    <Image source={iconSource} style={{ width: size, height: size * 0.55, borderRadius: 8 }} resizeMode="contain" />
  );
}
