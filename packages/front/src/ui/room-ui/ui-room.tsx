import React from 'react';


export const UIRoom: React.FC = () => {

    /**
     * List players (name)
     *  List characters (type, face)
     * Team
     */

    return (
        <div>

            <div>
                Map choice
                <ul>
                    <li>
                        <div>Map name 1</div>
                        <div>Preview</div>
                        <div>Size: XxX</div>
                        <div>Nbr teams max: X</div>
                        <div>Nbr characters max: X - X/team</div>
                        <button>Choise</button>
                    </li>
                    <li>
                        <div>Map name 2</div>
                        <div>Preview</div>
                        <div>Size: XxX</div>
                        <div>Nbr teams max: X</div>
                        <div>Nbr characters max: X - X/team</div>
                        <button disabled>Choised</button>
                    </li>
                </ul>
            </div>

            <div>
                
            </div>

        </div>
    );
};
