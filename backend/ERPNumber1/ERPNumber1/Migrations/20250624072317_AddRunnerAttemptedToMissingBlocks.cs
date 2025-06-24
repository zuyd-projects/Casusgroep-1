using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPNumber1.Migrations
{
    /// <inheritdoc />
    public partial class AddRunnerAttemptedToMissingBlocks : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "RunnerAttempted",
                table: "MissingBlocks",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "RunnerAttemptedAt",
                table: "MissingBlocks",
                type: "datetime2",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "RunnerAttempted",
                table: "MissingBlocks");

            migrationBuilder.DropColumn(
                name: "RunnerAttemptedAt",
                table: "MissingBlocks");
        }
    }
}
