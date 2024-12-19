import React, {ReactNode} from 'react';
import { View, Platform, ViewStyle  } from 'react-native';
import {SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"

interface CustomSafeAreaViewProps {
    children: ReactNode; // Any valid React node can be passed as children
    style?: ViewStyle;   // Optional style prop, can be a ViewStyle
  }

export default function CustomSafeAreaView({ children, style }: CustomSafeAreaViewProps) {
    // this is built because of a bug on ios that results in safeareaview not being calculated properly. However, it does do it properly when using safeareainsets
    // this causes issues on Android. As such, I am splitting it between platforms
    const insets = useSafeAreaInsets();

    if (Platform.OS === 'android') {
        // Use SafeAreaView for iOS
        return (
            <SafeAreaView style={[style]}>
            {children}
            </SafeAreaView>
        );
    }
    
    // Use View with custom insets for iOS
    return (
    <View
        style={[
        {
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
        },
        style,
        ]}
    >
        {children}
    </View>
    );

}