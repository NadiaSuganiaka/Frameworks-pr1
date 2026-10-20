import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiErrorDto } from '../common/api-error.dto.js';

@Controller('health')
@ApiTags('System')
export class HealthController {
    @Get()
    @ApiOperation({ summary: 'Check application health' })
    @ApiResponse({ status: 200, description: 'Health check succeeded' })
    @ApiResponse({ status: 400, type: ApiErrorDto })
    health(){
        return{
            status: "ok",
            timeStamp: Date.now(),
            massage: "Pretty froggy"
        }
    }
}
