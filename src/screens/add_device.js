import React, { useState } from 'react';
import { Button } from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { RNCamera } from 'react-native-camera';

import { getDBConnection, saveDeviceItems } from "../services/db-service";

const ScanDeviceScreen = ({ route, navigation }) => {
    const [flash, setFlash] = useState(false);

    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <Button onPress={() => setFlash(c => !c)} title="toggle flash" />
            ),
        });
    }, [navigation]);

    async function onSuccess(e) {
        if (e.data) {
            var data = JSON.parse(e.data)
            if (data.serial) {
                const db = await getDBConnection();
                await saveDeviceItems(db, [data]);
            }
        }
        navigation.goBack()
    };

    return (
        <QRCodeScanner
            onRead={onSuccess}
            flashMode={
                flash ? RNCamera.Constants.FlashMode.torch : RNCamera.Constants.FlashMode.off
            }
            showMarker={true}
        />
    );
}

module.exports = { ScanDeviceScreen };